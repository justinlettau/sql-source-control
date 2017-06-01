import * as deepmerge from 'deepmerge';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as xml2js from 'xml2js';
import { isString } from 'ts-util-is';

import { Config } from '../common/config';
import { Connection } from '../common/connection';

/**
 * Config file path.
 */
export const configFile: string = path.join(process.cwd(), 'ssc.json');

/**
 * Web config file path.
 */
export const webConfigFile: string = './Web.config';

/**
 * Default values for config file.
 */
export const configDefaults: Config = {
    connection: undefined,
    files: [],
    output: {
        root: '_sql-database',
        'scalar-valued': './functions/scalar-valued',
        'table-valued': './functions/table-valued',
        'procs': './stored-procedures',
        'tables': './tables',
        'triggers': './triggers',
        'views': './views'
    },
    idempotency: {
        'scalar-valued': 'if-exists-drop',
        'table-valued': 'if-exists-drop',
        'procs': 'if-exists-drop',
        'tables': 'if-not-exists',
        'triggers': 'if-exists-drop',
        'views': 'if-exists-drop'
    }
};

/**
 * Remove unsafe characters from file name.
 *
 * @param file Path and file name.
 */
export function safeFile(file: string): string {
    return file.replace(/\//g, '_');
}

/**
 * Get and parse config file.
 */
export function getConfig(): Config {
    let config: Config;

    try {
        config = fs.readJsonSync(configFile);
    } catch (error) {
        console.error('Could not find or parse config file. You can use the init command to create one!');
        process.exit();
    }

    if (isString(config.connection)) {
        // get connection info from web config file
        config.connection = getWebConfigConn(config.connection);
    }

    // validation
    if (!config.connection) {
        console.warn(`Required property 'connection' is missing from the config file!`);
    }

    return deepmerge(configDefaults, config);
}

/**
 * Write config file with provided object contents.
 *
 * @param config Object to save for config file.
 */
export function setConfig(config: Config): void {
    const content: string = JSON.stringify(config, null, 2);

    // save file
    fs.outputFile(configFile, content, (error: Error) => {
        if (error) {
            return console.error(error);
        }

        console.log('Config file created!');
    });
}

/**
 * Safely get connection options from `web.config` file, if available.
 *
 * @param file Optional relative path to web config.
 */
export function getWebConfigConn(file?: string): Connection {
    const parser = new xml2js.Parser();
    const webConfig: string = file || webConfigFile;
    let content: string;
    let conn: Connection;

    if (!fs.existsSync(webConfig)) {
        // default web config not found, use defaults
        return;
    }

    // read config file
    content = fs.readFileSync(webConfig, 'utf-8');

    // parse config file
    parser.parseString(content, (err, result): void => {
        let connParts: string[];

        if (err) {
            console.error(err);
            process.exit();
        }

        try {
            connParts = result.configuration.connectionStrings[0].add[0].$.connectionString.split(';');
        } catch (err) {
            console.error(`Could not parse connection string from Web.config file!`);
            process.exit();
        }

        // get connection string parts
        let server: string = connParts.find(x => /^(server)/ig.test(x));
        let database: string = connParts.find(x => /^(database)/ig.test(x));
        let port: number;
        let user: string = connParts.find(x => /^(uid)/ig.test(x));
        let password: string = connParts.find(x => /^(password|pwd)/ig.test(x));

        // get values from connection string parts
        server = (server && server.split('=')[1]);
        database = (database && database.split('=')[1]);
        user = (user && user.split('=')[1]);
        password = (password && password.split('=')[1]);

        // separate server and port
        if (server) {
            // format: `dev.example.com\instance,1435`
            const parts: string[] = server.split(',');

            server = parts[0];
            port = parseInt(parts[1], 10) || undefined;
        }

        conn = {
            server: server,
            database: database,
            port: port,
            user: user,
            password: password
        };
    });

    return conn;
}

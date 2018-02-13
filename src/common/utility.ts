import chalk from 'chalk';
import * as deepmerge from 'deepmerge';
import * as fs from 'fs-extra';
import * as glob from 'glob';
import * as path from 'path';
import { isString } from 'ts-util-is';
import * as xml2js from 'xml2js';

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
    connections: [],
    files: [],
    output: {
        'root': './_sql-database',
        'procs': './stored-procedures',
        'schemas': './schemas',
        'scalar-valued': './functions/scalar-valued',
        'table-valued': './functions/table-valued',
        'tables': './tables',
        'triggers': './triggers',
        'views': './views',
        'table-valued-parameters': './user-defined-types/table-valued-parameters',
    },
    idempotency: {
        'procs': 'if-exists-drop',
        'scalar-valued': 'if-exists-drop',
        'table-valued': 'if-exists-drop',
        'tables': 'if-not-exists',
        'triggers': 'if-exists-drop',
        'views': 'if-exists-drop',
        'table-valued-parameters': 'if-not-exists'
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
        console.error('Could not find or parse config file. You can use the `init` command to create one!');
        process.exit();
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
 * Get a list of all available connections.
 *
 * @param config Config object used to search for connections.
 */
export function getConns(config: Config): Connection[] {
    if (config.connection) {
        // deprecated (v1.1.0)
        console.warn(chalk.yellow('Warning! The config `connection` object is deprecated. Use `connections` instead.'));

        const legacyConn: string | Connection = config.connection;
        config.connections = (isString(legacyConn) ? legacyConn : [legacyConn]);
    }

    if (isString(config.connections)) {
        // get form web config
        return getWebConfigConns(config.connections);
    } else {
        return config.connections;
    }
}

/**
 * Get a connection object by name, or the first available if `name` is not provided.
 *
 * @param config Config object used to search for connection.
 * @param name Optional connection `name` to get.
 */
export function getConn(config: Config, name?: string): Connection {
    const conns: Connection[] = getConns(config);
    let conn: Connection;

    if (name) {
        conn = conns.find(item => item.name.toLocaleLowerCase() === name.toLowerCase());
    } else {
        // default to first
        conn = conns[0];
    }

    if (!conn) {
        const message: string = (name ? `Could not find connection by name '${name}'!` : 'Could not find default connection!');
        console.error(message);
        process.exit();
    }

    return conn;
}

/**
 * Safely get connections from `web.config` file, if available.
 *
 * @param file Optional relative path to web config.
 */
export function getWebConfigConns(file?: string): Connection[] {
    const parser: xml2js.Parser = new xml2js.Parser();
    const webConfig: string = file || webConfigFile;
    let content: string;
    const conns: Connection[] = [];

    if (!fs.existsSync(webConfig)) {
        // web config not found, use defaults
        return;
    }

    // read config file
    content = fs.readFileSync(webConfig, 'utf-8');

    // parse config file
    parser.parseString(content, (err, result): void => {
        if (err) {
            console.error(err);
            process.exit();
        }

        try {
            const connStrings: any[] = result.configuration.connectionStrings[0].add;

            for (const item of connStrings) {
                conns.push(parseConnString(item.$.name, item.$.connectionString));
            }

        } catch (err) {
            console.error('Could not parse connection strings from Web.config file!');
            process.exit();
        }
    });

    return (conns.length ? conns : undefined);
}

/**
 * Get all SQL files in correct execution order.
 *
 * @param config Config object used to search for connection.
 */
export function getFilesOrdered(config: Config): string[] {
    const output: string[] = [];
    const directories: string[] = [
        config.output.schemas,
        config.output.tables,
        config.output.views,
        config.output['scalar-valued'],
        config.output['table-valued'],
        config.output.procs,
        config.output.triggers,
        config.output['table-valued-parameters']
    ];

    for (const dir of directories) {
        const files: string[] = glob.sync(`${config.output.root}/${dir}/**/*.sql`);
        output.push(...files);
    }

    return output;
}

/**
 * Parse connection string into object.
 *
 * @param name Connection name.
 * @param connString Connection string to parse.
 */
function parseConnString(name: string, connString: string): Connection {
    const parts: string[] = connString.split(';');

    // match connection parts
    let server: string = parts.find(x => /^(server)/ig.test(x));
    let database: string = parts.find(x => /^(database)/ig.test(x));
    let user: string = parts.find(x => /^(uid)/ig.test(x));
    let password: string = parts.find(x => /^(password|pwd)/ig.test(x));
    let port: number;

    // get values
    server = (server && server.split('=')[1]);
    database = (database && database.split('=')[1]);
    user = (user && user.split('=')[1]);
    password = (password && password.split('=')[1]);

    // separate server and port
    if (server) {
        // format: `dev.example.com\instance,1435`
        const sub: string[] = server.split(',');

        server = sub[0];
        port = parseInt(sub[1], 10) || undefined;
    }

    return new Connection({
        name,
        server,
        database,
        port,
        user,
        password
    });
}

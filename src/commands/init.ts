import * as fs from 'fs-extra';
import * as inquirer from 'inquirer';

import { Connection } from '../common/connection';
import * as util from '../common/utility';

/**
 * CLI arguments for `init` command.
 */
interface InitOptions {
    webconfig?: string;
    force?: boolean;
    skip?: boolean;
}

/**
 * Create default config file.
 *
 * @param options CommanderJS options.
 */
export function init(options: InitOptions): void {
    const webConfigFile: string = options.webconfig || util.webConfigFile;
    const webConfigConns: Connection[] = util.getWebConfigConns(webConfigFile);
    const conn: Connection = new Connection();

    if (webConfigConns) {
        // use options from web config
        Object.assign(conn, webConfigConns[0]);
    }

    if (fs.existsSync(util.configFile) && !options.force) {
        // don't overwrite existing config file
        return console.error('Config file already exists!');
    }

    if (options.skip) {
        // skip prompts and create with defaults
        util.setConfig({ connections: options.webconfig || [conn] });
        return;
    }

    const questions: inquirer.Questions = [
        {
            name: 'path',
            message: 'Use connections from Web.config file?',
            type: 'confirm',
            when: (): boolean => !!webConfigConns
        }, {
            name: 'server',
            message: 'Server URL.',
            default: (conn.server || undefined),
            when: (answers): boolean => (!webConfigConns || !answers.path)
        }, {
            name: 'port',
            message: 'Server port.',
            default: (conn.port || undefined),
            when: (answers): boolean => (!webConfigConns || !answers.path)
        }, {
            name: 'database',
            message: 'Database name.',
            default: (conn.database || undefined),
            when: (answers): boolean => (!webConfigConns || !answers.path)
        }, {
            name: 'user',
            message: 'Login username.',
            default: (conn.user || undefined),
            when: (answers): boolean => (!webConfigConns || !answers.path)
        }, {
            name: 'password',
            message: 'Login password.',
            default: (conn.password || undefined),
            when: (answers): boolean => (!webConfigConns || !answers.path)
        }, {
            name: 'name',
            message: 'Connection name.',
            default: 'dev',
            when: (answers): boolean => (!webConfigConns || !answers.path)
        }
    ];

    // prompt user for config options
    inquirer.prompt(questions).then((answers: inquirer.Answers): void => {
        if (answers.path) {
            // use Web.config path
            util.setConfig({ connections: webConfigFile });
        } else {
            util.setConfig({
                connections: [new Connection({
                    name: answers.name,
                    server: answers.server,
                    port: answers.port,
                    database: answers.database,
                    user: answers.user,
                    password: answers.password
                })]
            });
        }
    });
}

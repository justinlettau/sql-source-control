import * as fs from 'fs-extra';
import * as inquirer from 'inquirer';

import * as util from '../common/utility';
import { Config } from '../common/config';
import { Connection } from '../common/connection';

/**
 * CLI arguments for `init` command.
 */
interface InitOptions {
    force?: boolean;
    skip?: boolean;
}

/**
 * Create default config file.
 *
 * @param options CommanderJS options.
 */
export function init(options: InitOptions): void {
    const conn: Connection = new Connection();

    if (fs.existsSync(util.configFile) && !options.force) {
        // don't overwrite existing config file
        return console.error('Config file already exists!');
    }

    if (options.skip) {
        // skip prompts and create with defaults
        util.setConfig({ connections: [conn] , currentConnection: conn});
        return;
    }

    const questions: inquirer.Questions = [
         {
            name: 'server',
            message: 'Server URL.',
            default: (conn.server || undefined),
            when: (answers): boolean => ( !answers.path)
        }, {
            name: 'port',
            message: 'Server port.',
            default: (conn.port || undefined),
            when: (answers): boolean => ( !answers.path)
        }, {
            name: 'database',
            message: 'Database name.',
            default: (conn.database || undefined),
            when: (answers): boolean => ( !answers.path)
        }, {
            name: 'user',
            message: 'Login username.',
            default: (conn.user || undefined),
            when: (answers): boolean => ( !answers.path)
        }, {
            name: 'password',
            message: 'Login password.',
            default: (conn.password || undefined),
            when: (answers): boolean => ( !answers.path)
        }, {
            name: 'name',
            message: 'Connection name.',
            default: 'dev',
            when: (answers): boolean => ( !answers.path)
        }
    ];

    // prompt user for config options
    inquirer.prompt(questions).then((answers: inquirer.Answers): void => {
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
    });
}

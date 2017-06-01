import * as fs from 'fs-extra';
import * as inquirer from 'inquirer';

import * as util from '../common/utility';
import { Config } from '../common/config';
import { Connection } from '../common/connection';

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
    const webConfigConn: Connection = util.getWebConfigConn(webConfigFile);
    const conn: Connection = new Connection();

    if (webConfigConn) {
        // use options from web config
        Object.assign(conn, webConfigConn);
    }

    if (fs.existsSync(util.configFile) && !options.force) {
        // don't overwrite existing config file
        return console.error('Config file already exists!');
    }

    if (options.skip) {
        // skip prompts and create with defaults
        util.setConfig({ connection: conn });
        return;
    }

    const questions: inquirer.Questions = [
        {
            name: 'path',
            message: 'Use web.config file?',
            type: 'confirm',
            when: () => !!webConfigConn
        }, {
            name: 'server',
            message: 'Server URL.',
            default: (conn.server || undefined),
            when: (answers) => (!webConfigConn || !answers.path)
        }, {
            name: 'port',
            message: 'Server port.',
            default: (conn.port || undefined),
            when: (answers) => (!webConfigConn || !answers.path)
        }, {
            name: 'database',
            message: 'Database name.',
            default: (conn.database || undefined),
            when: (answers) => (!webConfigConn || !answers.path)
        }, {
            name: 'user',
            message: 'Login username.',
            default: (conn.user || undefined),
            when: (answers) => (!webConfigConn || !answers.path)
        }, {
            name: 'password',
            message: 'Login password.',
            default: (conn.password || undefined),
            when: (answers) => (!webConfigConn || !answers.path)
        }
    ];

    // prompt user for config options
    inquirer.prompt(questions).then((answers: inquirer.Answers): void => {
        if (answers.path) {
            // use Web.config path
            util.setConfig({ connection: webConfigFile });
        } else {
            util.setConfig({
                connection: {
                    server: answers.server,
                    port: answers.port,
                    database: answers.database,
                    user: answers.user,
                    password: answers.password,
                }
            });
        }
    });
}

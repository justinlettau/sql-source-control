const fs = require('fs-extra');
const inquirer = require('inquirer');
const util = require('./utility');

module.exports = (options) => {
    const webConfigConn = util.getWebConfigConn(options.webconfig);
    const defaultConn = {
        server: '',
        port: 1433,
        database: '',
        user: '',
        password: ''
    };

    if (webConfigConn) {
        // use options from web config
        Object.assign(defaultConn, webConfigConn);
    }

    // don't overwrite existing config file
    if (fs.existsSync(util.configFile) && !options.force) {
        return console.error('Config file already exists!');
    }

    if (options.skip) {
        const conn = webConfigConn ? util.webConfigFile : defaultConn;
        createFile({ connection: conn });
    } else {
        // prompt user for config options
        inquirer.prompt([
            {
                name: 'path',
                message: 'Use web.config file?',
                type: 'confirm',
                when: () => webConfigConn
            }, {
                name: 'server',
                message: 'Server URL.',
                default: (defaultConn.server || undefined),
                when: (answers) => (!webConfigConn || !answers.path)
            }, {
                name: 'port',
                message: 'Server port.',
                default: (defaultConn.port || undefined),
                when: (answers) => (!webConfigConn || !answers.path)
            }, {
                name: 'database',
                message: 'Database name.',
                default: (defaultConn.database || undefined),
                when: (answers) => (!webConfigConn || !answers.path)
            }, {
                name: 'user',
                message: 'Login username.',
                default: (defaultConn.user || undefined),
                when: (answers) => (!webConfigConn || !answers.path)
            }, {
                name: 'password',
                message: 'Login password.',
                default: (defaultConn.password || undefined),
                when: (answers) => (!webConfigConn || !answers.path)
            }
        ]).then((answers) => {
            const conn = answers.path ? util.webConfigFile : answers;
            delete answers.path;
            createFile({ connection: conn });
        });
    }
};

/**
 * Write config file with provided object contents.
 *
 * @param config Object to save for config file.
 */
function createFile(config) {
    const content = JSON.stringify(config, null, 2);

    // save file
    fs.outputFile(util.configFile, content, (error) => {
        if (error) {
            return console.error(error);
        }

        console.log('Config file created!');
    });
}

const fs = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');
const util = require('./utility');
const file = path.join(process.cwd(), util.configFile);

module.exports = function (options) {

    // don't overwrite existing config file
    if (fs.existsSync(file) && !options.force) {
        return console.error('Config file already exists!');
    }

    if (options.skip) {

        // use defaults only
        createFile({
            name: '',
            port: 1433,
            user: '',
            password: '',
            databse: ''
        });
    } else {

        // prompt user for config options
        inquirer.prompt([
            {
                name: 'server',
                message: 'Server URL.'
            }, {
                name: 'port',
                message: 'Server port.',
                default: 1433
            }, {
                name: 'user',
                message: 'Login username.'
            }, {
                name: 'password',
                message: 'Login password.'
            }, {
                name: 'database',
                message: 'Database name.'
            }
        ]).then((answers) => createFile(answers));
    }
};

/**
 * Write config file with provided object contents.
 *
 * @param config Object to save for config file.
 */
function createFile(config) {
    const content = JSON.stringify(config, null, 2);

    // create default config file
    fs.outputFile(file, content, function (error) {
        if (error) {
            return console.error(error);
        }

        console.log('Config file created!');
    });
}

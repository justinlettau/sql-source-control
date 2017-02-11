const fs = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');
const util = require('./utility');

module.exports = function () {
    const file = path.join(process.cwd(), util.configFile);

    // don't overwrite existing config file
    if (fs.existsSync(file)) {
        return console.error('Config file already exists!');
    }

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
    ]).then((answers) => {
        const content = JSON.stringify(answers, null, 2);

        // create default config file
        fs.outputFile(file, content, function (error) {
            if (error) {
                return console.error(error);
            }

            console.log('Config file created! Make sure you edit the config file with your settings.');
        });
    });
};

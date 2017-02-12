const fs = require('fs-extra');
const inquirer = require('inquirer');
const path = require('path');
const util = require('./utility');
const xml2js = require('xml2js');
const file = path.join(process.cwd(), util.configFile);

module.exports = function (options) {

    // don't overwrite existing config file
    if (fs.existsSync(file) && !options.force) {
        return console.error('Config file already exists!');
    }

    return getDefaults().then((defaults) => {
        if (options.skip) {

            // use defaults only
            createFile(defaults);
        } else {

            // prompt user for config options
            inquirer.prompt([
                {
                    name: 'server',
                    message: 'Server URL.',
                    default: defaults.server
                }, {
                    name: 'port',
                    message: 'Server port.',
                    default: defaults.port
                }, {
                    name: 'database',
                    message: 'Database name.',
                    default: defaults.database
                }, {
                    name: 'user',
                    message: 'Login username.',
                    default: defaults.user
                }, {
                    name: 'password',
                    message: 'Login password.',
                    default: defaults.password
                }
            ]).then((answers) => createFile(answers));
        }
    });
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

/**
 * Get connection defaults.
 *
 * @return Promise that resolves with default config options.
 */
function getDefaults() {
    return new Promise((resolve, reject) => {
        let parser = new xml2js.Parser();
        let defaults = {
            server: '',
            port: 1433,
            database: '',
            user: '',
            password: ''
        };

        try {
            let webconfig = fs.readFileSync('./web.config', 'utf-8');

            // parse config file
            parser.parseString(webconfig, function (err, result) {
                if (err) {
                    return resolve(defaults);
                }

                // check for existing connection string
                let conn = result.configuration.connectionStrings[0].add[0].$.connectionString.split(';');

                // get connection string parts
                let server = conn.find(x => /^(server)/ig.test(x));
                let database = conn.find(x => /^(database)/ig.test(x));
                let port;
                let user = conn.find(x => /^(uid)/ig.test(x));
                let password = conn.find(x => /^(password|pwd)/ig.test(x));

                // get values from connection string parts
                server = (server && server.split('=')[1]);
                database = (database && database.split('=')[1]);
                user = (user && user.split('=')[1]);
                password = (password && password.split('=')[1]);

                // seperate server and port
                if (server) {
                    // format: `dev.example.com\instance,1435`
                    let parts = server.split(',');

                    server = parts[0];
                    port = parts[1];
                }

                return resolve(Object.assign(defaults, {
                    server: server,
                    database: database,
                    port: port,
                    user: user,
                    password: password
                }));
            });

        } catch (error) {
            // if `web.config` failes, return defaults below
        }

        return resolve(defaults);
    }).catch(err => console.error(err));
}

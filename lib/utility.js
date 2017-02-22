const deepmerge = require('deepmerge');
const fs = require('fs-extra');
const path = require('path');
const xml2js = require('xml2js');

module.exports = {

    /**
     * Config file path.
     */
    configFile: path.join(process.cwd(), 'ssc.json'),

    /**
     * Web config file path.
     */
    webConfigFile: './Web.config',

    /**
     * Default values for optional config values.
     */
    configDefaults: {
        files: [],
        output: {
            root: '_sql-database',
            'scalar-valued': './functions/scalar-valued',
            'table-valued': './functions/table-valued',
            procs: './stored-procedures',
            tables: './tables',
            triggers: './triggers',
            views: './views'
        },
        idempotency: {
            'scalar-valued': 'if-exists-drop',
            'table-valued': 'if-exists-drop',
            procs: 'if-exists-drop',
            tables: "if-not-exists",
            triggers: 'if-exists-drop',
            views: 'if-exists-drop'
        }
    },

    /**
     * Get safe name for file system.
     *
     * @param file path and file name.
     * @return Safe file path.
     */
    safeFile: function (file) {
        return file.replace(/\//g, '_');
    },

    /**
     * Get and parse config file.
     *
     * @returns Config object.
     */
    getConfig: function () {
        let config;

        try {
            config = fs.readJsonSync(this.configFile);
        } catch (error) {
            console.error(`Couldn't find config file. You can use the init command to create one!`);
            process.exit();
        }

        if (typeof config.connection === 'string') {
            // get connection from web config file
            config.connection = this.getWebConfigConn();
        }

        // validation
        if (!config.connection) {
            console.log(`Requied property 'connection' is missing from the config file!`);
        }

        return deepmerge(this.configDefaults, config);
    },

    /**
     * Safely get connection options from `web.config` file, if available.
     *
     * @param file Relative path to web config to use instead of default.
     * @returns Config connection object.
     */
    getWebConfigConn: function (file) {
        let parser = new xml2js.Parser();
        let webconfig = file || this.webConfigFile;
        let content;
        let conn;

        if (!fs.existsSync(webconfig)) {
            if (file) {
                console.error(`Couldn't find ${file}!`);
                process.exit();
            } else {
                // default web config not found, use defaults
                return;
            }
        }

        // read config file
        content = fs.readFileSync(webconfig, 'utf-8');

        // parse config file
        parser.parseString(content, function (err, result) {
            if (err) {
                return;
            }

            // check for existing connection string
            let cs = result.configuration.connectionStrings[0].add[0].$.connectionString.split(';');

            // get connection string parts
            let server = cs.find(x => /^(server)/ig.test(x));
            let database = cs.find(x => /^(database)/ig.test(x));
            let port;
            let user = cs.find(x => /^(uid)/ig.test(x));
            let password = cs.find(x => /^(password|pwd)/ig.test(x));

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

};

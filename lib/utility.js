const path = require('path');
const fs = require('fs-extra');

module.exports = {

    /**
     * Database source directory.
     */
    sourceDir: 'sql-database',

    /**
     * Config file name.
     */
    configFile: 'ssc.json',

    /**
     * Default config file values.
     */
    configDefaults: {
        user: '',
        password: '',
        server: '',
        database: '',
        port: 1433
    },

    /**
     * Get and parse config file.
     *
     * @returns Config object.
     */
    getConfig: function () {
        const file = path.join(process.cwd(), this.configFile);
        let config;

        try {
            config = fs.readJsonSync(file);
        } catch (e) {
            console.error(`Couldn't find ${this.configFile} file. You can use the init command to create one!`);
            process.exit();
        }

        // validate required fields
        for (let key of ['user', 'password', 'server', 'database']) {
            if (!config[key]) {
                console.log(`Requied property '${key}' is missing!`);
                process.exit();
            }
        }

        return config;
    }

};

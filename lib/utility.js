const path = require('path');
const fs = require('fs-extra');
const deepmerge = require('deepmerge');

module.exports = {

    /**
     * Config file name.
     */
    configFile: 'ssc.json',

    /**
     * Default values for optional config values.
     */
    configDefaults: {
        include: '',
        exclude: '',
        output: {
            root: 'sql-database',
            idempotency: false,
            procs: '/stored-procedures',
            views: '/views',
            'table-valued': '/functions/table-valued',
            'scalar-valued': '/functions/scalar-valued',
            triggers: '/triggers'
        }
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
        } catch (error) {
            console.error(`Couldn't find ${this.configFile} file. You can use the init command to create one!`);
            process.exit();
        }

        // validate required fields
        for (let key of ['user', 'password', 'server', 'database', 'port']) {
            if (!config[key]) {
                console.log(`Requied property '${key}' is missing from the config file!`);
                process.exit();
            }
        }

        return deepmerge(this.configDefaults, config);
    }

};

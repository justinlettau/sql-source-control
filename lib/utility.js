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
            tables: './tables',
            procs: './stored-procedures',
            views: './views',
            'table-valued': './functions/table-valued',
            'scalar-valued': './functions/scalar-valued',
            triggers: './triggers'
        },
        idempotency: {
            tables: "if-not-exists",
            procs: 'if-exists-drop',
            views: 'if-exists-drop',
            'table-valued': 'if-exists-drop',
            'scalar-valued': 'if-exists-drop',
            triggers: 'if-exists-drop'
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
    },

    /**
     * Get safe name for file system.
     *
     * @param file path and file name.
     * @return Safe file path.
     */
    safeFile: function (file) {
        return file.replace(/\//g, '_');
    }

};

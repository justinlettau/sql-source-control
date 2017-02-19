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

        // validation
        if (!config.connection) {
            console.log(`Requied property 'connection' is missing from the config file!`);
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

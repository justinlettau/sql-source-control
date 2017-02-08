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

        return fs.readJsonSync(file);
    }

};

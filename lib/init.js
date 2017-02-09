const fs = require('fs-extra');
const path = require('path');
const util = require('./utility');

module.exports = function () {
    const file = path.join(process.cwd(), util.configFile);
    const content = JSON.stringify(util.configDefaults, null, 2);

    // don't overwrite existing config file
    if (fs.existsSync(file)) {
        return console.error('Config file already exists!');
    }

    // create default config file
    fs.outputFile(file, content, function (error) {
        if (error) {
            return console.error(error);
        }

        console.log('Config file created! Make sure you edit the config file with your settings.');
    });
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs-extra");
var inquirer = require("inquirer");
var util = require("../common/utility");
var connection_1 = require("../common/connection");
/**
 * Create default config file.
 *
 * @param options CommanderJS options.
 */
function init(options) {
    var webConfigFile = options.webconfig || util.webConfigFile;
    var webConfigConns = util.getWebConfigConns(webConfigFile);
    var conn = new connection_1.Connection();
    if (webConfigConns) {
        // use options from web config
        Object.assign(conn, webConfigConns[0]);
    }
    if (fs.existsSync(util.configFile) && !options.force) {
        // don't overwrite existing config file
        return console.error('Config file already exists!');
    }
    if (options.skip) {
        // skip prompts and create with defaults
        util.setConfig({ connections: options.webconfig || [conn] });
        return;
    }
    var questions = [
        {
            name: 'path',
            message: 'Use connections from Web.config file?',
            type: 'confirm',
            when: function () { return !!webConfigConns; }
        }, {
            name: 'server',
            message: 'Server URL.',
            default: (conn.server || undefined),
            when: function (answers) { return (!webConfigConns || !answers.path); }
        }, {
            name: 'port',
            message: 'Server port.',
            default: (conn.port || undefined),
            when: function (answers) { return (!webConfigConns || !answers.path); }
        }, {
            name: 'database',
            message: 'Database name.',
            default: (conn.database || undefined),
            when: function (answers) { return (!webConfigConns || !answers.path); }
        }, {
            name: 'user',
            message: 'Login username.',
            default: (conn.user || undefined),
            when: function (answers) { return (!webConfigConns || !answers.path); }
        }, {
            name: 'password',
            message: 'Login password.',
            default: (conn.password || undefined),
            when: function (answers) { return (!webConfigConns || !answers.path); }
        }, {
            name: 'name',
            message: 'Connection name.',
            default: 'dev',
            when: function (answers) { return (!webConfigConns || !answers.path); }
        }
    ];
    // prompt user for config options
    inquirer.prompt(questions).then(function (answers) {
        if (answers.path) {
            // use Web.config path
            util.setConfig({ connections: webConfigFile });
        }
        else {
            util.setConfig({
                connections: [new connection_1.Connection({
                        name: answers.name,
                        server: answers.server,
                        port: answers.port,
                        database: answers.database,
                        user: answers.user,
                        password: answers.password,
                    })]
            });
        }
    });
}
exports.init = init;
//# sourceMappingURL=init.js.map
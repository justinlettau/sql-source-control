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
    var conn = new connection_1.Connection();
    if (fs.existsSync(util.configFile) && !options.force) {
        // don't overwrite existing config file
        return console.error('Config file already exists!');
    }
    if (options.skip) {
        // skip prompts and create with defaults
        util.setConfig({ connections: [conn], currentConnection: conn });
        return;
    }
    var questions = [
        {
            name: 'server',
            message: 'Server URL.',
            default: (conn.server || undefined),
            when: function (answers) { return (!answers.path); }
        }, {
            name: 'port',
            message: 'Server port.',
            default: (conn.port || undefined),
            when: function (answers) { return (!answers.path); }
        }, {
            name: 'database',
            message: 'Database name.',
            default: (conn.database || undefined),
            when: function (answers) { return (!answers.path); }
        }, {
            name: 'user',
            message: 'Login username.',
            default: (conn.user || undefined),
            when: function (answers) { return (!answers.path); }
        }, {
            name: 'password',
            message: 'Login password.',
            default: (conn.password || undefined),
            when: function (answers) { return (!answers.path); }
        }, {
            name: 'name',
            message: 'Connection name.',
            default: 'dev',
            when: function (answers) { return (!answers.path); }
        }
    ];
    // prompt user for config options
    inquirer.prompt(questions).then(function (answers) {
        util.setConfig({
            connections: [new connection_1.Connection({
                    name: answers.name,
                    server: answers.server,
                    port: answers.port,
                    database: answers.database,
                    user: answers.user,
                    password: answers.password
                })]
        });
    });
}
exports.init = init;
//# sourceMappingURL=init.js.map
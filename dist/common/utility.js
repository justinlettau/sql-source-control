"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chalk = require("chalk");
var deepmerge = require("deepmerge");
var fs = require("fs-extra");
var path = require("path");
var connection_1 = require("../common/connection");
/**
 * Config file path.
 */
exports.configFile = path.join(process.cwd(), 'ssc.json');
/**
 * Default values for config file.
 */
exports.configDefaults = {
    connections: [],
    currentConnection: '',
    output: {
        'root': '_sql_database',
        'procs': './stored-procedures',
        'schemas': './schemas',
        'scalar-valued': './functions/scalar-valued',
        'table-valued': './functions/table-valued',
        'tables': './tables',
        'triggers': './triggers',
        'views': './views'
    },
    idempotency: {
        'procs': 'if-exists-drop',
        'scalar-valued': 'if-exists-drop',
        'table-valued': 'if-exists-drop',
        'tables': 'if-not-exists',
        'triggers': 'if-exists-drop',
        'views': 'if-exists-drop'
    }
};
/**
 * Remove unsafe characters from file name.
 *
 * @param file Path and file name.
 */
function safeFile(file) {
    return file.replace(/\//g, '_');
}
exports.safeFile = safeFile;
/**
 * Get and parse config file.
 */
function getConfig() {
    var config;
    try {
        config = fs.readJsonSync(exports.configFile);
    }
    catch (error) {
        console.error('Could not find or parse config file. You can use the `init` command to create one!');
        process.exit();
    }
    return deepmerge(exports.configDefaults, config);
}
exports.getConfig = getConfig;
/**
 * Write config file with provided object contents.
 *
 * @param config Object to save for config file.
 */
function setConfig(config) {
    var content = JSON.stringify(config, null, 2);
    // save file
    fs.outputFile(exports.configFile, content, function (error) {
        if (error) {
            return console.error(error);
        }
        console.log('Config file created!');
    });
}
exports.setConfig = setConfig;
/**
 * Get a connection object by name, or the first available if `name` is not provided.
 *
 * @param config Config object used to search for connection.
 * @param name Optional connection `name` to get.
 */
function getConn(config, name) {
    var conns;
    var conn;
    if (config.connection) {
        // deprecated (v1.1.0)
        console.warn(chalk.yellow('Warning! The config `connection` object is deprecated. Use `connections` instead.'));
        var legacyConn = config.connection;
        config.connections = [legacyConn];
    }
    conns = config.connections;
    if (name) {
        conn = conns.find(function (item) { return item.name.toLocaleLowerCase() === name.toLowerCase(); });
    }
    else {
        // default to first
        conn = conns[0];
    }
    if (!conn) {
        var message = (name ? "Could not find connection by name '" + name + "'!" : 'Could not find default connection!');
        console.error(message);
        process.exit();
    }
    return conn;
}
exports.getConn = getConn;
/**
 * Parse connection string into object.
 *
 * @param name Connection name.
 * @param connString Connection string to parse.
 */
function parseConnString(name, connString) {
    var parts = connString.split(';');
    // match connection parts
    var server = parts.find(function (x) { return /^(server)/ig.test(x); });
    var database = parts.find(function (x) { return /^(database)/ig.test(x); });
    var user = parts.find(function (x) { return /^(uid)/ig.test(x); });
    var password = parts.find(function (x) { return /^(password|pwd)/ig.test(x); });
    var port;
    // get values
    server = (server && server.split('=')[1]);
    database = (database && database.split('=')[1]);
    user = (user && user.split('=')[1]);
    password = (password && password.split('=')[1]);
    // separate server and port
    if (server) {
        // format: `dev.example.com\instance,1435`
        var sub = server.split(',');
        server = sub[0];
        port = parseInt(sub[1], 10) || undefined;
    }
    return new connection_1.Connection({
        name: name,
        server: server,
        database: database,
        port: port,
        user: user,
        password: password
    });
}
//# sourceMappingURL=utility.js.map
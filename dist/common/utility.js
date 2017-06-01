"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var deepmerge = require("deepmerge");
var fs = require("fs-extra");
var path = require("path");
var xml2js = require("xml2js");
var ts_util_is_1 = require("ts-util-is");
/**
 * Config file path.
 */
exports.configFile = path.join(process.cwd(), 'ssc.json');
/**
 * Web config file path.
 */
exports.webConfigFile = './Web.config';
/**
 * Default values for config file.
 */
exports.configDefaults = {
    connection: undefined,
    files: [],
    output: {
        root: '_sql-database',
        'scalar-valued': './functions/scalar-valued',
        'table-valued': './functions/table-valued',
        'procs': './stored-procedures',
        'tables': './tables',
        'triggers': './triggers',
        'views': './views'
    },
    idempotency: {
        'scalar-valued': 'if-exists-drop',
        'table-valued': 'if-exists-drop',
        'procs': 'if-exists-drop',
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
        console.error('Could not find or parse config file. You can use the init command to create one!');
        process.exit();
    }
    if (ts_util_is_1.isString(config.connection)) {
        // get connection info from web config file
        config.connection = getWebConfigConn(config.connection);
    }
    // validation
    if (!config.connection) {
        console.warn("Required property 'connection' is missing from the config file!");
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
 * Safely get connection options from `web.config` file, if available.
 *
 * @param file Optional relative path to web config.
 */
function getWebConfigConn(file) {
    var parser = new xml2js.Parser();
    var webConfig = file || exports.webConfigFile;
    var content;
    var conn;
    if (!fs.existsSync(webConfig)) {
        // default web config not found, use defaults
        return;
    }
    // read config file
    content = fs.readFileSync(webConfig, 'utf-8');
    // parse config file
    parser.parseString(content, function (err, result) {
        var connParts;
        if (err) {
            console.error(err);
            process.exit();
        }
        try {
            connParts = result.configuration.connectionStrings[0].add[0].$.connectionString.split(';');
        }
        catch (err) {
            console.error("Could not parse connection string from Web.config file!");
            process.exit();
        }
        // get connection string parts
        var server = connParts.find(function (x) { return /^(server)/ig.test(x); });
        var database = connParts.find(function (x) { return /^(database)/ig.test(x); });
        var port;
        var user = connParts.find(function (x) { return /^(uid)/ig.test(x); });
        var password = connParts.find(function (x) { return /^(password|pwd)/ig.test(x); });
        // get values from connection string parts
        server = (server && server.split('=')[1]);
        database = (database && database.split('=')[1]);
        user = (user && user.split('=')[1]);
        password = (password && password.split('=')[1]);
        // separate server and port
        if (server) {
            // format: `dev.example.com\instance,1435`
            var parts = server.split(',');
            server = parts[0];
            port = parseInt(parts[1], 10) || undefined;
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
exports.getWebConfigConn = getWebConfigConn;
//# sourceMappingURL=utility.js.map
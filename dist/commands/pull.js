"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = require("chalk");
var fs = require("fs-extra");
var glob = require("glob");
var sql = require("mssql");
var multimatch = require("multimatch");
var path = require("path");
var ts_util_is_1 = require("ts-util-is");
var util = require("../common/utility");
var script = require("../sql/script");
var sys_1 = require("../sql/sys");
/**
 * Generate SQL files for all tables, stored procedures, functions, etc.
 *
 * @param name Connection name to use.
 */
function pull(name) {
    var start = process.hrtime();
    var config = util.getConfig();
    var conn = util.getConn(config, name);
    console.log("Pulling " + chalk_1.default.magenta(conn.database) + " from " + chalk_1.default.magenta(conn.server) + " ...");
    // connect to db
    new sql.ConnectionPool(conn)
        .connect()
        .then(function (pool) {
        return Promise.all([
            pool.request().query(sys_1.objectRead),
            pool.request().query(sys_1.tableRead),
            pool.request().query(sys_1.columnRead),
            pool.request().query(sys_1.primaryKeyRead),
            pool.request().query(sys_1.foreignKeyRead),
            pool.request().query(sys_1.indexRead),
            pool.request().query(sys_1.tvpRead)
        ]).then(function (results) {
            pool.close();
            return results;
        });
    })
        .then(function (results) { return scriptFiles(config, results); })
        .then(function () {
        var time = process.hrtime(start);
        console.log(chalk_1.default.green("Finished after " + time[0] + "s!"));
    })
        .catch(function (err) { return console.error(err); });
}
exports.pull = pull;
/**
 * Write all requested files to the file system based on `results`.
 *
 * @param config Current configuration to use.
 * @param results Array of data sets from SQL queries.
 */
function scriptFiles(config, results) {
    var existing = glob.sync(config.output.root + "/**/*.sql");
    // note: array order MUST match query promise array
    var objects = results[0].recordset;
    var tables = results[1].recordset;
    var columns = results[2].recordset;
    var primaryKeys = results[3].recordset;
    var foreignKeys = results[4].recordset;
    var indexes = results[5].recordset;
    var tvps = results[6].recordset;
    // get unique schema names
    var schemas = tables
        .map(function (item) { return item.schema; })
        .filter(function (value, index, array) { return array.indexOf(value) === index; })
        .map(function (value) { return ({ name: value, type: 'SCHEMA' }); });
    // write files for schemas
    for (var _i = 0, schemas_1 = schemas; _i < schemas_1.length; _i++) {
        var item = schemas_1[_i];
        var file = util.safeFile(item.name + ".sql");
        if (!include(config, file)) {
            continue;
        }
        var content = script.schema(item);
        var dir = createFile(config, item, file, content);
        exclude(config, existing, dir);
    }
    // write files for stored procedures, functions, ect.
    for (var _a = 0, objects_1 = objects; _a < objects_1.length; _a++) {
        var item = objects_1[_a];
        var file = util.safeFile(item.schema + "." + item.name + ".sql");
        if (!include(config, file)) {
            continue;
        }
        var dir = createFile(config, item, file, item.text);
        exclude(config, existing, dir);
    }
    // write files for tables
    for (var _b = 0, tables_1 = tables; _b < tables_1.length; _b++) {
        var item = tables_1[_b];
        var file = util.safeFile(item.schema + "." + item.name + ".sql");
        if (!include(config, file)) {
            continue;
        }
        var content = script.table(item, columns, primaryKeys, foreignKeys, indexes);
        var dir = createFile(config, item, file, content);
        exclude(config, existing, dir);
    }
    // write files for user-defined table-valued parameter
    for (var _c = 0, tvps_1 = tvps; _c < tvps_1.length; _c++) {
        var item = tvps_1[_c];
        var file = util.safeFile(item.schema + "." + item.name + ".sql");
        if (!include(config, file)) {
            continue;
        }
        var content = script.tvp(item, columns);
        var dir = createFile(config, item, file, content);
        exclude(config, existing, dir);
    }
    // all remaining files in `existing` need deleted
    removeFiles(existing);
}
/**
 * Write SQL file script to the file system with correct options.
 *
 * @param config Current configuration to use.
 * @param item Row from query.
 * @param file Name of file to create.
 * @param content Script file contents.
 */
function createFile(config, item, file, content) {
    var dir;
    var output;
    var type;
    switch (item.type.trim()) {
        case 'SCHEMA':// not a real object type
            output = config.output.schemas;
            type = null;
            break;
        case 'U':
            output = config.output.tables;
            type = config.idempotency.tables;
            break;
        case 'P':
            output = config.output.procs;
            type = config.idempotency.procs;
            break;
        case 'V':
            output = config.output.views;
            type = config.idempotency.views;
            break;
        case 'TF':
        case 'IF':
            output = config.output['table-valued'];
            type = config.idempotency['table-valued'];
            break;
        case 'FN':
            output = config.output['scalar-valued'];
            type = config.idempotency['scalar-valued'];
            break;
        case 'TR':
            output = config.output.triggers;
            type = config.idempotency.triggers;
            break;
        case 'TT':
            output = config.output['table-valued-parameters'];
            type = config.idempotency['table-valued-parameters'];
            break;
        default:
            output = 'unknown';
    }
    // get full output path
    dir = path.join(config.output.root, output, file);
    // idempotent prefix
    content = script.idempotency(item, type) + content;
    // create file
    console.log("Creating " + chalk_1.default.cyan(dir) + " ...");
    fs.outputFileSync(dir, content.trim());
    return dir;
}
/**
 * Check if a file passes the `files` glob pattern.
 *
 * @param config Current configuration to use.
 * @param file File path to check.
 */
function include(config, file) {
    if (!config.files || !config.files.length) {
        return true;
    }
    if (!ts_util_is_1.isArray(file)) {
        file = [file];
    }
    var results = multimatch(file, config.files);
    return !!results.length;
}
/**
 * Remove `dir` from `existing` if it exists.
 *
 * @param config Current configuration to use.
 * @param existing Collection of file paths to check against.
 * @param dir File path to check.
 */
function exclude(config, existing, dir) {
    if (config.output.root.startsWith('./') && !dir.startsWith('./')) {
        dir = "./" + dir;
    }
    var index = existing.indexOf(dir.replace(/\\/g, '/'));
    if (index !== -1) {
        existing.splice(index, 1);
    }
}
/**
 * Delete all paths in `files`.
 *
 * @param files Array of file paths to delete.
 */
function removeFiles(files) {
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        console.log("Removing " + chalk_1.default.cyan(file) + " ...");
        fs.removeSync(file);
    }
}
//# sourceMappingURL=pull.js.map
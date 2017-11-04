"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chalk = require("chalk");
var fs = require("fs-extra");
var path = require("path");
var sql = require("mssql");
var util = require("../common/utility");
var context_1 = require("../commands/context");
/**
 * Generate SQL files for sql query data.
 * @param sqlSelect
 * @param outputfilename
 */
function sql2file(sqlSelect, outputfilename) {
    var start = process.hrtime();
    var config = util.getConfig();
    var conn;
    if (context_1.context !== '') {
        conn = util.getConn(config, context_1.context);
    }
    else {
        console.log(chalk.red('context is need to set with "use" '));
        return;
    }
    // connect to db
    new sql.ConnectionPool(conn)
        .connect()
        .then(function (pool) {
        return Promise.all([
            pool.request().query(sqlSelect)
        ]).then(function (results) {
            pool.close();
            return results;
        });
    }) // write files for tables
        .then(function (results) {
        resultsetTofiles(config, results, outputfilename);
    })
        .then(function () {
        var time = process.hrtime(start);
        console.log(chalk.green("Finished after " + time[0] + "s!"));
    })
        .catch(function (err) { return console.error(err); });
}
exports.sql2file = sql2file;
/**
 * Write all requested files to the file system based on `results`.
 *
 * @param config Current configuration to use.
 * @param results Array of data sets from SQL queries.
 * @param filename out file name
 */
function resultsetTofiles(config, results, filename) {
    var columns = [];
    var contenttext = [];
    for (var obj in results[0].recordset.columns) {
        if (false !== false) {
            columns.push('\t' + obj);
        }
        else {
            columns.push('\t' + obj);
            contenttext.push('\t' + obj);
        }
    }
    // combine content of table
    for (var _i = 0, _a = results[0].recordset; _i < _a.length; _i++) {
        var row = _a[_i];
        contenttext.push('\n');
        for (var _b = 0, columns_1 = columns; _b < columns_1.length; _b++) {
            var col = columns_1[_b];
            contenttext.push(row[col.replace('\t', '')] + '\t');
        }
    }
    if (contenttext.length > 0) {
        var dir = void 0;
        // get full output path
        dir = path.join(config.output.root, filename);
        // create file
        console.log("Creating '" + chalk.cyan(dir) + "' ");
        fs.outputFileSync(dir, contenttext.join('').trim());
        console.log("Create success '" + chalk.cyan(dir) + "' ");
    }
}
//# sourceMappingURL=sql2file.js.map
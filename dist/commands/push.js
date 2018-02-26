"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = require("chalk");
var fs = require("fs-extra");
var sql = require("mssql");
var os_1 = require("os");
var util = require("../common/utility");
/**
 * Execute all scripts against the requested database.
 *
 * @param name Connection name to use.
 */
function push(name) {
    var start = process.hrtime();
    var config = util.getConfig();
    var conn = util.getConn(config, name);
    console.log("Pushing to " + chalk_1.default.magenta(conn.database) + " on " + chalk_1.default.magenta(conn.server) + " ...");
    var files = util.getFilesOrdered(config);
    var promise = new sql.ConnectionPool(conn).connect();
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        console.log("Executing " + chalk_1.default.cyan(file) + " ...");
        var content = fs.readFileSync(file, 'utf8');
        var statements = content.split('go' + os_1.EOL);
        var _loop_1 = function (statement) {
            promise = promise.then(function (pool) {
                return pool.request().batch(statement).then(function (result) { return pool; });
            });
        };
        for (var _a = 0, statements_1 = statements; _a < statements_1.length; _a++) {
            var statement = statements_1[_a];
            _loop_1(statement);
        }
    }
    promise
        .then(function () {
        var time = process.hrtime(start);
        console.log(chalk_1.default.green("Finished after " + time[0] + "s!"));
    })
        .catch(function (err) { return console.error(err); });
}
exports.push = push;
//# sourceMappingURL=push.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chalk = require("chalk");
var fs = require("fs-extra");
var glob = require("glob");
var os_1 = require("os");
var util = require("../common/utility");
/**
 * Concatenate all SQL files into a single file.
 */
function cat() {
    var start = process.hrtime();
    var config = util.getConfig();
    var output = '';
    // order is important
    var directories = [
        config.output.schemas,
        config.output.tables,
        config.output.views,
        config.output['scalar-valued'],
        config.output['table-valued'],
        config.output.views,
        config.output.procs,
        config.output.triggers
    ];
    for (var _i = 0, directories_1 = directories; _i < directories_1.length; _i++) {
        var dir = directories_1[_i];
        var files = glob.sync(config.output.root + "/" + dir + "/**/*.sql");
        for (var _a = 0, files_1 = files; _a < files_1.length; _a++) {
            var file = files_1[_a];
            var content = fs.readFileSync(file).toString();
            var end = content.substr(-2).toLowerCase();
            output += content;
            output += os_1.EOL;
            output += (end !== 'go' ? 'go' : '');
            output += os_1.EOL + os_1.EOL;
        }
    }
    fs.outputFileSync(config.output.root + "/cat.sql", output);
    var time = process.hrtime(start);
    console.log(chalk.green("Finished after " + time[0] + "s!"));
}
exports.cat = cat;
//# sourceMappingURL=cat.js.map
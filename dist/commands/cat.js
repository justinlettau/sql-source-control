"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = require("chalk");
var fs = require("fs-extra");
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
    var files = util.getFilesOrdered(config);
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        var content = fs.readFileSync(file).toString();
        var end = content.substr(-2).toLowerCase();
        output += content;
        output += os_1.EOL;
        output += (end !== 'go' ? 'go' : '');
        output += os_1.EOL + os_1.EOL;
    }
    fs.outputFileSync(config.output.root + "/cat.sql", output);
    var time = process.hrtime(start);
    console.log(chalk_1.default.green("Finished after " + time[0] + "s!"));
}
exports.cat = cat;
//# sourceMappingURL=cat.js.map
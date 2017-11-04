"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chalk = require("chalk");
var util = require("../common/utility");
var child_process_1 = require("child_process");
var ts_util_is_1 = require("ts-util-is");
/**
 * set context of connection.
 *
 * @param name Connection name to use.
 */
function use(name) {
    // setEnvirenmentValue('nodeSscContext' , name);
    var ccrt = 'nodeSscCurrentcontext';
    process.env[ccrt] = name;
    console.log("context has not changed to " + chalk.magenta(process.env[ccrt]) + ", this funciton not finished!");
}
exports.use = use;
/**
 * show context of connection.
 * @param name Optional context name to query
 */
function show(name) {
    var config = util.getConfig();
    if (ts_util_is_1.isUndefined(name)) {
        for (var cnct in config.connections) {
            if (cnct) {
                showDetails(config.connections[cnct]);
            }
        }
    }
    else if (name !== '') {
        var conn = void 0;
        if (name) {
            conn = config.connections.find(function (item) { return item.name.toLocaleLowerCase() === name.toLowerCase(); });
        }
        else {
            // default to first
            conn = config.connections[0];
        }
        if (!!conn) {
            showDetails(conn);
        }
        else {
            console.log(chalk.red('链接' + name + '不存在'));
        }
    }
    else {
        console.log(chalk.red('no context was set, you need to set context with "use" command'));
        return;
    }
}
exports.show = show;
function showDetails(conn) {
    var ccrt = 'nodeSscCurrentcontext';
    console.log(process.env[ccrt] + " is current ;\n" + conn.name + " :\nname is [" + conn.name + "];\nserver is [" + conn.server + "];\nport is [" + conn.port + "];\ndatabase is [" + conn.database + "];\nuser is [" + conn.user + "];\npassword is [" + conn.password + "];\n    ");
}
/**
 * set Envirenment
 * @param {string} name
 * @param {string} value
 */
function setEnvirenmentValue(name, value) {
    child_process_1.exec("export " + name + "=" + value, function (err, stdout, stderr) {
        if (err) {
            console.log(chalk.red('node: environment set error:' + stderr));
        }
        else {
            console.log("set envirentment success ! export " + name + "=` + " + value + " ");
        }
    });
}
/**
 * get Envirentment value by name
 * @param {string} name
 * @returns {string}
 */
function getEnvirentmentValue(name) {
    var valuestr = '';
    child_process_1.exec("echo $" + name, function (err, stdout, stderr) {
        if (err) {
            console.log(chalk.red('error:' + stderr));
        }
        else {
            valuestr = stdout.replace('\n', '');
            console.log("get envirentment success ! " + name + "=` + " + valuestr + " ");
        }
    });
    return valuestr;
}
//# sourceMappingURL=context.js.map
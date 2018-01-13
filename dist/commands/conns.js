"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Table = require("cli-table");
var util = require("../common/utility");
/**
 * List all available connections.
 */
function conns() {
    var config = util.getConfig();
    var connections = util.getConns(config);
    var placeholder = 'n/a';
    var table = new Table({
        head: ['Name', 'Server', 'Port', 'Database', 'User', 'Password']
    });
    for (var _i = 0, connections_1 = connections; _i < connections_1.length; _i++) {
        var conn = connections_1[_i];
        table.push([
            conn.name || placeholder,
            conn.server || placeholder,
            conn.port || placeholder,
            conn.database || placeholder,
            conn.user || placeholder,
            conn.password || placeholder
        ]);
    }
    console.log(table.toString());
}
exports.conns = conns;
//# sourceMappingURL=conns.js.map
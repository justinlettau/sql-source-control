"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * SQL server connection configuration.
 */
var Connection = (function () {
    function Connection(conn) {
        this.name = '';
        this.server = '';
        this.database = '';
        this.port = 1433;
        this.user = '';
        this.password = '';
        if (conn) {
            Object.assign(this, conn);
        }
    }
    return Connection;
}());
exports.Connection = Connection;
//# sourceMappingURL=connection.js.map
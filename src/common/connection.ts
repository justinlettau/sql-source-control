/**
 * SQL server connection configuration.
 */
export class Connection {
    constructor(conn?: Connection) {
        if (conn) {
            Object.assign(this, conn);
        }
    }

    public name: string = '';
    public server: string = '';
    public database: string = '';
    public port?: number = 1433;
    public user: string = '';
    public password: string = '';
}

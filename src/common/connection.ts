/**
 * SQL server connection configuration.
 */
export class Connection {
    public server: string = '';
    public database: string = '';
    public port?: number = 1433;
    public user: string = '';
    public password: string = '';
}

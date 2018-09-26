import { IConnection } from './interfaces';

/**
 * Connection configuration.
 */
export default class Connection implements IConnection {
  constructor(conn?: IConnection) {
    this.loadFromObject(conn);
  }

  /**
   * Connection name.
   */
  public name: string;

  /**
   * Server name.
   */
  public server: string;

  /**
   * Database name.
   */
  public database: string;

  /**
   * Server port.
   */
  public port: number;

  /**
   * Login username.
   */
  public user: string;

  /**
   * Login password.
   */
  public password: string;

  /**
   * Parse connection string into object.
   *
   * @param name Connection name.
   * @param connString Connection string to parse.
   */
  public loadFromString(name: string, connString: string): void {
    const parts: string[] = connString.split(';');

    // match connection parts
    let server: string = parts.find(x => /^(server)/ig.test(x));
    let database: string = parts.find(x => /^(database)/ig.test(x));
    let user: string = parts.find(x => /^(uid)/ig.test(x));
    let password: string = parts.find(x => /^(password|pwd)/ig.test(x));
    let port: number;

    // get values
    server = (server && server.split('=')[1]);
    database = (database && database.split('=')[1]);
    user = (user && user.split('=')[1]);
    password = (password && password.split('=')[1]);

    // separate server and port
    if (server) {
      // format: `dev.example.com\instance,1435`
      const sub: string[] = server.split(',');

      server = sub[0];
      port = parseInt(sub[1], 10) || undefined;
    }

    Object.assign(this, {
      name,
      server,
      database,
      port,
      user,
      password
    });
  }

  /**
   * Load connection object.
   *
   * @param conn Connection object to load.
   */
  public loadFromObject(conn: IConnection): void {
    if (!conn) {
      return;
    }

    Object.assign(this, conn);
  }
}

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
  name: string;

  /**
   * Server name.
   */
  server: string;

  /**
   * Database name.
   */
  database: string;

  /**
   * Server port.
   */
  port: number;

  /**
   * Login username.
   */
  user: string;

  /**
   * Login password.
   */
  password: string;

  /**
   * Parse connection string into object.
   *
   * @param name Connection name.
   * @param connString Connection string to parse.
   */
  loadFromString(name: string, connString: string) {
    const parts = connString.split(';');

    // match connection parts
    let server = parts.find((x) => /^(server)/gi.test(x));
    let database = parts.find((x) => /^(database)/gi.test(x));
    let user = parts.find((x) => /^(uid)/gi.test(x));
    let password = parts.find((x) => /^(password|pwd)/gi.test(x));
    let port: number;

    // get values
    server = server && server.split('=')[1];
    database = database && database.split('=')[1];
    user = user && user.split('=')[1];
    password = password && password.split('=')[1];

    // separate server and port
    if (server) {
      // format: `dev.example.com\instance,1435`
      const sub = server.split(',');

      server = sub[0];
      port = parseInt(sub[1], 10) || undefined;
    }

    Object.assign(this, {
      database,
      name,
      password,
      port,
      server,
      user,
    });
  }

  /**
   * Load connection object.
   *
   * @param conn Connection object to load.
   */
  loadFromObject(conn: IConnection) {
    if (!conn) {
      return;
    }

    Object.assign(this, conn);
  }
}

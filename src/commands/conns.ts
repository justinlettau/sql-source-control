import * as Table from 'cli-table';

import { Config } from '../common/config';
import { Connection } from '../common/connection';

export class Conns {

  /**
   * Invoke action.
   */
  public invoke(): void {
    const config: Config = new Config();
    const connections: Connection[] = config.getConnections();
    const placeholder: string = 'n/a';

    const table: Table = new Table({
      head: ['Name', 'Server', 'Port', 'Database', 'User', 'Password']
    });

    connections.forEach(conn => {
      table.push([
        conn.name || placeholder,
        conn.server || placeholder,
        conn.port || placeholder,
        conn.database || placeholder,
        conn.user || placeholder,
        conn.password || placeholder
      ]);
    });

    console.log(table.toString());
  }
}

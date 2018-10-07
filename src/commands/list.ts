import * as Table from 'cli-table';

import Config from '../common/config';
import Connection from '../common/connection';
import { ListOptions } from './interfaces';

export default class List {
  constructor(private options: ListOptions) { }

  /**
   * Invoke action.
   */
  public invoke(): void {
    const config: Config = new Config(this.options.config);
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

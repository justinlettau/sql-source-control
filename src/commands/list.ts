// @ts-ignore
import * as Table from 'cli-table';

import Config from '../common/config';
import { ListOptions } from './interfaces';

export default class List {
  constructor(private options: ListOptions) {}

  /**
   * Invoke action.
   */
  invoke() {
    const config = new Config(this.options.config);
    const connections = config.getConnections();
    const placeholder = 'n/a';

    const table = new Table({
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

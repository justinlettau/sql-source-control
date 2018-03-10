import * as Table from 'cli-table';

import { Config } from '../common/config';
import { Connection } from '../common/connection';
import * as util from '../common/utility';

/**
 * List all available connections.
 */
export function conns(): void {
  const config: Config = util.getConfig();
  const connections: Connection[] = util.getConns(config);
  const placeholder: string = 'n/a';

  const table: Table = new Table({
    head: ['Name', 'Server', 'Port', 'Database', 'User', 'Password']
  });

  for (const conn of connections) {
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

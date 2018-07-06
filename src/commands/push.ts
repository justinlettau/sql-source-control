import chalk from 'chalk';
import * as fs from 'fs-extra';
import * as glob from 'glob';
import * as sql from 'mssql';
import { EOL } from 'os';

import { Config } from '../common/config';
import { Connection } from '../common/connection';
import * as util from '../common/utility';

/**
 * Execute all scripts against the requested database.
 *
 * @param name Connection name to use.
 */
export function push(name?: string): void {
  const start: [number, number] = process.hrtime();
  const config: Config = util.getConfig();
  const conn: Connection = util.getConn(config, name);

  console.log(`Pushing to ${chalk.magenta(conn.database)} on ${chalk.magenta(conn.server)} ...`);

  let content = util.getAllFilesContent()

  let promise: Promise<sql.ConnectionPool> = new sql.ConnectionPool(conn).connect();
  if (content.includes('{synonym_target}')) {
      content = content.replace(new RegExp('{synonym_target}', 'g'), conn.synonym_target);
  }

  let statements: string[] = content.split('GO' + EOL);

  statements.forEach(statement => {
      promise = promise.then(pool => {
          return pool.request().batch(statement).then(result => pool);
      });
  });

  promise
    .then(() => {
      const time: [number, number] = process.hrtime(start);
      console.log(chalk.green(`Finished after ${time[0]}s!`));
    })
    .catch(err => console.error(err));
}

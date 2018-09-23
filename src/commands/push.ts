import chalk from 'chalk';
import * as fs from 'fs-extra';
import * as sql from 'mssql';
import { EOL } from 'os';

import { Config } from '../common/config';
import { Connection } from '../common/connection';
import Utility from '../common/utility';

export class Push {

  /**
   * Invoke actions.
   *
   * @param name Optional connection name to use.
   */
  public invoke(name?: string): void {
    const start: [number, number] = process.hrtime();
    const config: Config = new Config();
    const conn: Connection = config.getConnection(name);

    console.log(`Pushing to ${chalk.magenta(conn.database)} on ${chalk.magenta(conn.server)} ...`);

    const files: string[] = Utility.getFilesOrdered(config);
    let promise: Promise<sql.ConnectionPool> = new sql.ConnectionPool(conn).connect();

    files.forEach(file => {
      console.log(`Executing ${chalk.cyan(file)} ...`);

      const content: string = fs.readFileSync(file, 'utf8');
      const statements: string[] = content.split('go' + EOL);

      statements.forEach(statement => {
        promise = promise.then(pool => {
          return pool.request().batch(statement).then(result => pool);
        });
      });
    });

    promise
      .then(() => {
        const time: [number, number] = process.hrtime(start);
        console.log(chalk.green(`Finished after ${time[0]}s!`));
      })
      .catch(err => console.error(err));
  }
}

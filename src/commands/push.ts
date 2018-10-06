import chalk from 'chalk';
import * as fs from 'fs-extra';
import * as glob from 'glob';
import * as sql from 'mssql';
import { EOL } from 'os';

import Config from '../common/config';
import Connection from '../common/connection';

export default class Push {

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

    const files: string[] = this.getFilesOrdered(config);
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

  /**
   * Get all SQL files in correct execution order.
   *
   * @param config Config object used to search for connection.
   */
  public getFilesOrdered(config: Config): string[] {
    const output: string[] = [];
    const directories: string[] = [
      config.output.schemas,
      config.output.tables,
      config.output.types,
      config.output.views,
      config.output.functions,
      config.output.procs,
      config.output.triggers,
      config.output.data
    ] as string[];

    directories.forEach(dir => {
      if (dir) {
        const files: string[] = glob.sync(`${config.output.root}/${dir}/**/*.sql`);
        output.push(...files);
      }
    });

    return output;
  }
}

import chalk from 'chalk';
import * as fs from 'fs-extra';
import * as glob from 'glob';
import * as inquirer from 'inquirer';
import * as sql from 'mssql';
import * as ora from 'ora';
import { EOL } from 'os';

import Config from '../common/config';
import Connection from '../common/connection';
import { PushOptions } from './interfaces';

export default class Push {

  /**
   * Spinner instance.
   */
  // tslint:disable-next-line:typedef
  private spinner = ora();

  /**
   * Invoke actions.
   *
   * @param name Optional connection name to use.
   * @param options CLI options.
   */
  public invoke(name: string, options: PushOptions): void {
    const config: Config = new Config();
    const conn: Connection = config.getConnection(name);

    inquirer.prompt<inquirer.Answers>([
      {
        name: 'continue',
        message: [
          'WARNING! All local SQL files will be executed against the requested database.',
          'This can not be undone!',
          'Make sure to backup your database first.',
          EOL,
          'Are you sure you want to continue?'
        ].join(' '),
        type: 'confirm',
        when: !options.skip
      }
    ])
      .then(answers => {
        if (answers.continue === false) {
          throw new Error('Command aborted!');
        }
      })
      .then(() => this.batch(config, conn))
      .then(() => this.spinner.succeed('Sucessfully pushed!'))
      .catch(error => this.spinner.fail(error));
  }

  /**
   * Execute all files against database.
   *
   * @param config Configuration used to execute commands.
   * @param conn Connection used to execute commands.
   */
  private batch(config: Config, conn: Connection): Promise<any> {
    const files: string[] = this.getFilesOrdered(config);
    let promise: Promise<sql.ConnectionPool> = new sql.ConnectionPool(conn).connect();

    this.spinner.start(`Pushing to ${chalk.blue(conn.server)} ...`);

    files.forEach(file => {
      const content: string = fs.readFileSync(file, 'utf8');
      const statements: string[] = content.split('go' + EOL);

      statements.forEach(statement => {
        promise = promise.then(pool => {
          return pool.request().batch(statement).then(() => pool);
        });
      });
    });

    return promise;
  }

  /**
   * Get all SQL files in correct execution order.
   *
   * @param config Configuration used to search for connection.
   */
  private getFilesOrdered(config: Config): string[] {
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

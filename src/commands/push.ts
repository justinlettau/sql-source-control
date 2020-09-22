import chalk = require('chalk');
import * as fs from 'fs-extra';
import * as glob from 'glob';
import * as inquirer from 'inquirer';
import * as sql from 'mssql';
import ora = require('ora');
import { EOL } from 'os';

import Config from '../common/config';
import Connection from '../common/connection';
import { PushOptions } from './interfaces';

export default class Push {
  constructor(private name: string, private options: PushOptions) {}

  /**
   * Spinner instance.
   */
  private spinner = ora();

  /**
   * Invoke actions.
   */
  invoke() {
    const config = new Config(this.options.config);
    const conn = config.getConnection(this.name);

    inquirer
      .prompt<inquirer.Answers>([
        {
          message: [
            `${chalk.yellow(
              'WARNING!'
            )} All local SQL files will be executed against the requested database.`,
            'This can not be undone!',
            'Make sure to backup your database first.',
            EOL,
            'Are you sure you want to continue?',
          ].join(' '),
          name: 'continue',
          type: 'confirm',
          when: !this.options.skip,
        },
      ])
      .then((answers) => {
        if (answers.continue === false) {
          throw new Error('Command aborted!');
        }
      })
      .then(() => this.batch(config, conn))
      .then(() => this.spinner.succeed('Successfully pushed!'))
      .catch((error) => this.spinner.fail(error));
  }

  /**
   * Execute all files against database.
   *
   * @param config Configuration used to execute commands.
   * @param conn Connection used to execute commands.
   */
  private batch(config: Config, conn: Connection) {
    const files = this.getFilesOrdered(config);
    let promise = new sql.ConnectionPool(conn).connect();

    this.spinner.start(`Pushing to ${chalk.blue(conn.server)} ...`);

    files.forEach((file) => {
      const content = fs.readFileSync(file, 'utf8');
      const statements = content.split('GO' + EOL);

      statements.forEach((statement) => {
        promise = promise.then((pool) => {
          return pool
            .request()
            .batch(statement)
            .then(() => pool);
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
  private getFilesOrdered(config: Config) {
    const output: string[] = [];
    const directories = [
      config.output.schemas,
      config.output.tables,
      config.output.types,
      config.output.views,
      config.output.functions,
      config.output.procs,
      config.output.triggers,
      config.output.data,
      config.output.jobs,
    ];

    directories.forEach((dir) => {
      if (dir) {
        const files = glob.sync(`${config.getRoot()}/${dir}/**/*.sql`);
        output.push(...files);
      }
    });

    return output;
  }
}

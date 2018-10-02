import chalk from 'chalk';
import * as fs from 'fs-extra';
import * as glob from 'glob';
import * as sql from 'mssql';
import * as multimatch from 'multimatch';
import * as path from 'path';
import { isArray } from 'ts-util-is';

import Config from '../common/config';
import Connection from '../common/connection';
import { IdempotencyObject } from '../common/types';
import Utility from '../common/utility';
import {
  SqlColumn,
  SqlDataResult,
  SqlForeignKey,
  SqlIndex,
  SqlObject,
  SqlPrimaryKey,
  SqlSchema,
  SqlTable,
  SqlTableValuedParameter
} from '../sql/interfaces';
import * as script from '../sql/script';
import { columnRead, foreignKeyRead, indexRead, objectRead, primaryKeyRead, tableRead, tvpRead } from '../sql/sys';
import { PullOptions } from './interfaces';

export default class Pull {

  /**
   * Invoke action.
   *
   * @param name Optional connection name to use.
   * @param options. CLI options.
   */
  public invoke(name: string, options: PullOptions): void {
    const start: [number, number] = process.hrtime();
    const config: Config = new Config(options.config);
    const conn: Connection = config.getConnection(name);

    console.log(`Pulling ${chalk.magenta(conn.database)} from ${chalk.magenta(conn.server)} ...`);

    // connect to db
    new sql.ConnectionPool(conn)
      .connect()
      .then(pool => {
        return Promise.all<any>([
          pool.request().query(objectRead),
          pool.request().query(tableRead),
          pool.request().query(columnRead),
          pool.request().query(primaryKeyRead),
          pool.request().query(foreignKeyRead),
          pool.request().query(indexRead),
          pool.request().query(tvpRead),
          ...config.data.map(table => {
            return pool.request()
              .query(`select * from ${table}`)
              .then(result => ({ name: table, type: 'DATA', result }));
          })
        ]).then(results => {
          pool.close();
          return results;
        });
      })
      .then(results => this.scriptFiles(config, results))
      .then(() => {
        const time: [number, number] = process.hrtime(start);
        console.log(chalk.green(`Finished after ${time[0]}s!`));
      })
      .catch(err => console.error(err));
  }

  /**
   * Write all requested files to the file system based on `results`.
   *
   * @param config Current configuration to use.
   * @param results Array of data sets from SQL queries.
   */
  private scriptFiles(config: Config, results: any[]): void {
    const existing: string[] = glob.sync(`${config.output.root}/**/*.sql`);

    // note: array order MUST match query promise array
    const objects: SqlObject[] = results[0].recordset;
    const tables: SqlTable[] = results[1].recordset;
    const columns: SqlColumn[] = results[2].recordset;
    const primaryKeys: SqlPrimaryKey[] = results[3].recordset;
    const foreignKeys: SqlForeignKey[] = results[4].recordset;
    const indexes: SqlIndex[] = results[5].recordset;
    const tvps: SqlTableValuedParameter[] = results[6].recordset;
    const data: SqlDataResult[] = results.slice(7);

    // get unique schema names
    const schemas: SqlSchema[] = tables
      .map(item => item.schema)
      .filter((value, index, array) => array.indexOf(value) === index)
      .map(value => ({ name: value, type: 'SCHEMA' }));

    // write files for schemas
    schemas.forEach(item => {
      const file: string = Utility.safeFile(`${item.name}.sql`);

      if (!this.include(config.files, file)) {
        return;
      }

      const content: string = script.schema(item);
      const dir: string = this.createFile(config, item, file, content);
      this.exclude(config, existing, dir);
    });

    // write files for stored procedures, functions, ect.
    objects.forEach(item => {
      const file: string = Utility.safeFile(`${item.schema}.${item.name}.sql`);

      if (!this.include(config.files, file)) {
        return;
      }

      const dir: string = this.createFile(config, item, file, item.text);
      this.exclude(config, existing, dir);
    });

    // write files for tables
    tables.forEach(item => {
      const file: string = Utility.safeFile(`${item.schema}.${item.name}.sql`);

      if (!this.include(config.files, file)) {
        return;
      }

      const content: string = script.table(item, columns, primaryKeys, foreignKeys, indexes);
      const dir: string = this.createFile(config, item, file, content);
      this.exclude(config, existing, dir);
    });

    // write files for user-defined table-valued parameter
    tvps.forEach(item => {
      const file: string = Utility.safeFile(`${item.schema}.${item.name}.sql`);

      if (!this.include(config.files, file)) {
        return;
      }

      const content: string = script.tvp(item, columns);
      const dir: string = this.createFile(config, item, file, content);
      this.exclude(config, existing, dir);
    });

    // write files for data
    data.forEach(item => {
      const file: string = Utility.safeFile(`${item.name}.sql`);

      if (!this.include(config.data, item.name)) {
        return;
      }

      const content: string = script.data(item, config.idempotency.data);
      const dir: string = this.createFile(config, item, file, content);
      this.exclude(config, existing, dir);
    });

    // all remaining files in `existing` need deleted
    this.removeFiles(existing);
  }

  /**
   * Write SQL file script to the file system with correct options.
   *
   * @param config Current configuration to use.
   * @param item Row from query.
   * @param file Name of file to create.
   * @param content Script file contents.
   */
  private createFile(config: Config, item: any, file: string, content: string): string {
    let dir: string;
    let output: string | false;
    let type: IdempotencyObject;

    switch (item.type.trim()) {
      case 'SCHEMA': // not a real object type
        output = config.output.schemas;
        type = null;
        break;
      case 'DATA': // not a real object type
        output = config.output.data;
        type = null;
        break;
      case 'U':
        output = config.output.tables;
        type = config.idempotency.tables;
        break;
      case 'P':
        output = config.output.procs;
        type = config.idempotency.procs;
        break;
      case 'V':
        output = config.output.views;
        type = config.idempotency.views;
        break;
      case 'TF':
      case 'IF':
        output = config.output['table-valued'];
        type = config.idempotency['table-valued'];
        break;
      case 'FN':
        output = config.output['scalar-valued'];
        type = config.idempotency['scalar-valued'];
        break;
      case 'TR':
        output = config.output.triggers;
        type = config.idempotency.triggers;
        break;
      case 'TT':
        output = config.output['table-valued-parameters'];
        type = config.idempotency['table-valued-parameters'];
        break;
      default:
        output = 'unknown';
    }

    if (output) {

      // get full output path
      dir = path.join(config.output.root, output, file);

      // idempotent prefix
      content = script.idempotency(item, type) + content;

      // create file
      console.log(`Creating ${chalk.cyan(dir)} ...`);
      fs.outputFileSync(dir, content.trim());
    }

    return dir;
  }

  /**
   * Check if a file passes the glob pattern.
   *
   * @param files Glob pattern to check against.
   * @param file File path to check.
   */
  private include(files: string[], file: string | string[]): boolean {
    if (!files || !files.length) {
      return true;
    }

    if (!isArray(file)) {
      file = [file];
    }

    const results: string[] = multimatch(file, files);
    return !!results.length;
  }

  /**
   * Remove `dir` from `existing` if it exists.
   *
   * @param config Current configuration to use.
   * @param existing Collection of file paths to check against.
   * @param dir File path to check.
   */
  private exclude(config: Config, existing: string[], dir: string): void {
    if (!dir) {
      return;
    }

    if (config.output.root.startsWith('./') && !dir.startsWith('./')) {
      dir = `./${dir}`;
    }

    const index: number = existing.indexOf(dir.replace(/\\/g, '/'));

    if (index !== -1) {
      existing.splice(index, 1);
    }
  }

  /**
   * Delete all paths in `files`.
   *
   * @param files Array of file paths to delete.
   */
  private removeFiles(files: string[]): void {
    files.forEach(file => {
      console.log(`Removing ${chalk.cyan(file)} ...`);
      fs.removeSync(file);
    });
  }
}

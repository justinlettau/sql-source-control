import chalk from 'chalk';
import * as sql from 'mssql';
import * as multimatch from 'multimatch';
import * as ora from 'ora';

import Config from '../common/config';
import Connection from '../common/connection';
import FileUtility from '../common/file-utility';
import MSSQLGenerator from '../generators/mssql';
import {
  SqlColumn,
  SqlDataResult,
  SqlForeignKey,
  SqlIndex,
  SqlObject,
  SqlPrimaryKey,
  SqlTable,
  SqlType
} from '../queries/interfaces';
import {
  columnsRead,
  foreignKeysRead,
  indexesRead,
  objectsRead,
  primaryKeysRead,
  tablesRead,
  typesRead
} from '../queries/mssql';
import { PullOptions } from './interfaces';

export default class Pull {
  constructor(private name: string, private options: PullOptions) { }

  /**
   * Spinner instance.
   */
  // tslint:disable-next-line:typedef
  private spinner = ora();

  /**
   * Invoke action.
   */
  public invoke(): void {
    const config: Config = new Config(this.options.config);
    const conn: Connection = config.getConnection(this.name);

    this.spinner.start(`Pulling from ${chalk.blue(conn.server)} ...`);

    // connect to db
    new sql.ConnectionPool(conn)
      .connect()
      .then(pool => {
        return Promise.all<sql.IResult<any>>([
          pool.request().query(objectsRead),
          pool.request().query(tablesRead),
          pool.request().query(columnsRead),
          pool.request().query(primaryKeysRead),
          pool.request().query(foreignKeysRead),
          pool.request().query(indexesRead),
          pool.request().query(typesRead)
        ])
          .then(results => {
            const tables: string[] = results[1].recordset
              .map(item => `${item.schema}.${item.name}`);

            const matched: string[] = multimatch(tables, config.data);

            if (!matched.length) {
              return results;
            }

            return Promise.all<any>(
              matched.map(item => {
                return pool.request()
                  .query(`select * from ${item}`)
                  .then(result => ({ name: item, result }));
              })
            )
              .then(data => [...results, ...data]);
          })
          .then(results => {
            pool.close();
            return results;
          });
      })
      .then(results => this.writeFiles(config, results))
      .catch(error => this.spinner.fail(error));
  }

  /**
   * Write all files to the file system based on `results`.
   *
   * @param config Current configuration to use.
   * @param results Array of data sets from SQL queries.
   */
  private writeFiles(config: Config, results: any[]): void {

    // note: array order MUST match query promise array
    const objects: SqlObject[] = results[0].recordset;
    const tables: SqlTable[] = results[1].recordset;
    const columns: SqlColumn[] = results[2].recordset;
    const primaryKeys: SqlPrimaryKey[] = results[3].recordset;
    const foreignKeys: SqlForeignKey[] = results[4].recordset;
    const indexes: SqlIndex[] = results[5].recordset;
    const types: SqlType[] = results[6].recordset;
    const data: SqlDataResult[] = results.slice(7);

    const generator: MSSQLGenerator = new MSSQLGenerator(config);
    const file: FileUtility = new FileUtility(config);

    // schemas
    tables
      .map(item => item.schema)
      .filter((value, index, array) => array.indexOf(value) === index)
      .map(value => ({ name: value }))
      .forEach(item => {
        const name: string = `${item.name}.sql`;
        const content: string = generator.schema(item);

        file.write(config.output.schemas, name, content);
      });

    // stored procedures
    objects
      .filter(item => item.type.trim() === 'P')
      .forEach(item => {
        const name: string = `${item.schema}.${item.name}.sql`;
        const content: string = generator.storedProcedure(item);

        file.write(config.output.procs, name, content);
      });

    // views
    objects
      .filter(item => item.type.trim() === 'V')
      .forEach(item => {
        const name: string = `${item.schema}.${item.name}.sql`;
        const content: string = generator.view(item);

        file.write(config.output.views, name, content);
      });

    // functions
    objects
      .filter(item => ['TF', 'IF', 'FN'].indexOf(item.type.trim()) !== -1)
      .forEach(item => {
        const name: string = `${item.schema}.${item.name}.sql`;
        const content: string = generator.function(item);

        file.write(config.output.functions, name, content);
      });

    // triggers
    objects
      .filter(item => item.type.trim() === 'TR')
      .forEach(item => {
        const name: string = `${item.schema}.${item.name}.sql`;
        const content: string = generator.trigger(item);

        file.write(config.output.triggers, name, content);
      });

    // tables
    tables.forEach(item => {
      const name: string = `${item.schema}.${item.name}.sql`;
      const content: string = generator.table(item, columns, primaryKeys, foreignKeys, indexes);

      file.write(config.output.tables, name, content);
    });

    // types
    types.forEach(item => {
      const name: string = `${item.schema}.${item.name}.sql`;
      const content: string = generator.type(item, columns);

      file.write(config.output.types, name, content);
    });

    // data
    data.forEach(item => {
      const name: string = `${item.name}.sql`;
      const content: string = generator.data(item);

      file.write(config.output.data, name, content);
    });

    const msg: string = file.finalize();
    this.spinner.succeed(msg);
  }
}

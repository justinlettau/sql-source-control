import chalk from 'chalk';
import * as fs from 'fs-extra';
import * as glob from 'glob';
import * as sql from 'mssql';
import * as multimatch from 'multimatch';
import * as path from 'path';
import { isArray } from 'ts-util-is';

import { Config } from '../common/config';
import { Connection } from '../common/connection';
import { IdempotencyOption } from '../common/idempotency';
import * as util from '../common/utility';
import {
  ColumnRecordSet,
  DataRecordSet,
  ForeignKeyRecordSet,
  IndexRecordSet,
  ObjectRecordSet,
  PrimaryKeyRecordSet,
  SchemaRecordSet,
  TableRecordSet,
  TvpRecordSet,
  FullTextCatalogRecordSet,
  FullTextStopListRecordSet,
  FullTextStopWordRecordSet,
  DefaultConstraintRecordSet,
  SynonymRecordSet,
  FullTextIndexRecordSet
} from '../sql/record-set';
import * as script from '../sql/script';
import { columnRead, foreignKeyRead, indexRead, objectRead, primaryKeyRead, tableRead, tvpRead, fullTextCatalogRead, fullTextStopListRead, fullTextStopWordsRead, defaultConstraintsRead, synonymsRead, fullTextIndexRead } from '../sql/sys';

/**
 * Generate SQL files for all tables, stored procedures, functions, etc.
 *
 * @param name Connection name to use.
 */
export function pull(name: string): void {
  const start: [number, number] = process.hrtime();
  const config: Config = util.getConfig();
  const conn: Connection = util.getConn(config, name);

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
        pool.request().query(fullTextCatalogRead),
        pool.request().query(fullTextStopListRead),
        pool.request().query(fullTextStopWordsRead),
        pool.request().query(defaultConstraintsRead),
        pool.request().query(synonymsRead),
        pool.request().query(fullTextIndexRead),
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
    .then(results => scriptFiles(config, results))
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
function scriptFiles(config: Config, results: any[]): void {
  const existing: string[] = glob.sync(`${config.output.root}/**/*.sql`);

  // note: array order MUST match query promise array
  const objects: ObjectRecordSet[] = results[0].recordset;
  const tables: TableRecordSet[] = results[1].recordset;
  const columns: ColumnRecordSet[] = results[2].recordset;
  const primaryKeys: PrimaryKeyRecordSet[] = results[3].recordset;
  const foreignKeys: ForeignKeyRecordSet[] = results[4].recordset;
  const indexes: IndexRecordSet[] = results[5].recordset;
  const tvps: TvpRecordSet[] = results[6].recordset;
  const ftCatalogs: FullTextCatalogRecordSet[] = results[7].recordset;
  const ftStopLists: FullTextStopListRecordSet[] = results[8].recordset;
  const ftStopWords: FullTextStopWordRecordSet[] = results[9].recordset;
  const defaultConstraints: DefaultConstraintRecordSet[] = results[10].recordset;
  const synonyms: SynonymRecordSet[] = results[11].recordset;
  const fullTextIndexes: FullTextIndexRecordSet[] = results[12].recordset;
  const data: DataRecordSet[] = results.slice(13);

  // get unique schema names
  const schemas: SchemaRecordSet[] = tables
    .map(item => item.schema)
    .filter((value, index, array) => array.indexOf(value) === index)
      .map(value => ({ name: value, type: 'SCHEMA' }));

  let procs: ObjectRecordSet[] = objects.filter(x => x.type.trim() == 'P');

  //write a prep file that drops foreign keys, if they exist
  if (foreignKeys.length > 0) {
      let content: string = '';
      const fkPrepFile: string = util.safeFile(`DropForeignKeys.sql`);
      foreignKeys.forEach(item => {
          const file: string = util.safeFile(`${item.constraint_schema}.${item.constraint_table}.sql`);

          if (!include(config.files, file)) {
              return;
          }

          content += script.dropForeignKey(item);
      });

      const dir: string = createPrepFile(config, fkPrepFile, content);

      exclude(config, existing, dir);
  }

  if (synonyms.length > 0) {
      let content: string = '';
      const syPrepFile: string = util.safeFile(`DropSynonyms.sql`);
      synonyms.forEach(item => {
          const file: string = util.safeFile(`${item.schema}.${item.name}.sql`);

          if (!include(config.files, file)) {
              return;
          }

          content += script.dropSynonyms(item);
      });

      const dir: string = createPrepFile(config, syPrepFile, content);

      exclude(config, existing, dir);
  }

  //write a prep file that drops constraints, if they exist
  if (defaultConstraints.length > 0) {
      let content: string = '';
      const dcPrepFile: string = util.safeFile(`DropConstraints.sql`);
      defaultConstraints.forEach(item => {
          const file: string = util.safeFile(`${item.schema}.${item.table_name}.sql`);

          if (!include(config.files, file)) {
              return;
          }

          content += script.dropConstraint(item);
      });

      const dir: string = createPrepFile(config, dcPrepFile, content);

      exclude(config, existing, dir);
  }

  //write a prep file that drops full text catalogs, if they exist
  if (ftCatalogs.length > 0) {
      let content: string = '';
      const ftPrepFile: string = util.safeFile(`DropFullTextIndexes&Catalogs.sql`);

      fullTextIndexes.forEach(item => {
          const file: string = util.safeFile(`${item.scheme}.${item.table_name}.sql`);

          if (!include(config.files, file)) {
              return;
          }

          content += script.dropFulltextIndex(item);
      });

      ftCatalogs.forEach(item => {
          const file: string = util.safeFile(`${item.name}.sql`);

          if (!include(config.files, file)) {
              return;
          }

          content += script.dropFulltextCatalog(item);
      });

      const dir: string = createPrepFile(config, ftPrepFile, content);

      exclude(config, existing, dir);
  }

  //write a prep file that drops procedures, if they exist
  if (procs.length > 0) {
      let content: string = '';
      const procPrepFile: string = util.safeFile(`DropProcedures.sql`);
      procs.forEach(item => {
          const file: string = util.safeFile(`${item.schema}.${item.name}.sql`);

          if (!include(config.files, file)) {
              return;
          }

          content += script.dropProcedure(item);
      });

      const dir: string = createPrepFile(config, procPrepFile, content);

      exclude(config, existing, dir);
  }

  // write files for schemas
  schemas.forEach(item => {
    const file: string = util.safeFile(`${item.name}.sql`);

    if (!include(config.files, file)) {
      return;
    }

    const content: string = script.schema(item);
    const dir: string = createFile(config, item, file, content);
    exclude(config, existing, dir);
  });

  // write files for stored procedures, functions, ect.
  objects.forEach(item => {
    const file: string = util.safeFile(`${item.schema}.${item.name}.sql`);

    if (!include(config.files, file)) {
      return;
    }

    let content = script.getStatement(item);

    const dir: string = createFile(config, item, file, content);
    exclude(config, existing, dir);
  });

  // write files for tables
  tables.forEach(item => {
      const file: string = util.safeFile(`${item.schema}.${item.name}.sql`);
      const existingFile: string = path.join(config.output.root, config.output.tables, file);

      if (config.idempotency.tables == 'if-not-exists' && fs.existsSync(existingFile)) {
          let content: string = fs.readFileSync(existingFile).toString();

          content = script.updateTable(content, item, columns);
          const dir: string = createSpecialFile(config, file, content, "update-table");
          exclude(config, existing, dir);
      } else {
          if (!include(config.files, file)) {
              return;
          }

          const content: string = script.table(item, columns, primaryKeys, indexes);
          const dir: string = createFile(config, item, file, content);
          exclude(config, existing, dir);
      }
  });

  // write files for user-defined table-valued parameter
  tvps.forEach(item => {
    const file: string = util.safeFile(`${item.schema}.${item.name}.sql`);

    if (!include(config.files, file)) {
      return;
    }

    const content: string = script.tvp(item, columns);
    const dir: string = createFile(config, item, file, content);
    exclude(config, existing, dir);
  });

  // write files for data
  data.forEach(item => {
    const file: string = util.safeFile(`${item.name}.sql`);

    if (!include(config.data, item.name)) {
      return;
    }

    let table: TableRecordSet = tables.find(x => (x.schema + "." + x.name) == item.name);
    let columnList: ColumnRecordSet[] = table ? columns.filter(a => a.object_id == table.object_id) : null;    
    let has_identity_column: boolean = columnList ? !!columnList.find(b => b.is_identity) : false;

    const content: string = script.data(item, has_identity_column);
    const dir: string = createFile(config, item, file, content);
    exclude(config, existing, dir);
  });

  // write a file that applies all foreign keys
  if (foreignKeys.length > 0) {
      let content: string = '';
      const fkPostFile: string = util.safeFile(`ApplyForeignKeys.sql`);
      foreignKeys.forEach(item => {
          const file: string = util.safeFile(`${item.constraint_schema}.${item.constraint_table}.sql`);

          if (!include(config.files, file)) {
              return;
          }

          content += script.foreignKey(item);
      });

      const dir: string = createSpecialFile(config, fkPostFile, content, "fk");

      exclude(config, existing, dir);
  }

  // write a file that applies all foreign keys
  if (defaultConstraints.length > 0) {
      let content: string = '';
      const dcPostFile: string = util.safeFile(`ApplyConstraints.sql`);
      defaultConstraints.forEach(item => {
          const file: string = util.safeFile(`${item.schema}.${item.table_name}.sql`);

          if (!include(config.files, file)) {
              return;
          }

          content += script.constraint(item);
      });

      const dir: string = createSpecialFile(config, dcPostFile, content, "constraint");

      exclude(config, existing, dir);
  }

  if (ftCatalogs.length > 0) {
      ftCatalogs.forEach(item => {
          const file: string = util.safeFile(`${item.name}.sql`);
          const content: string = script.fullTextCatalog(item);

          if (!include(config.files, file)) {
              return;
          }

          const dir: string = createSpecialFile(config, file, content, "ft-catalog");
          exclude(config, existing, dir);
      });
  }

  if (ftStopLists.length > 0) {
      ftStopLists.forEach(item => {
          const file: string = util.safeFile(`${item.name}.sql`);
          const content: string = script.fullTextStopList(item, ftStopWords);

          if (!include(config.files, file)) {
              return;
          }

          const dir: string = createSpecialFile(config, file, content, "ft-stoplist");
          exclude(config, existing, dir);
      });
  }

  if (synonyms.length > 0) {
      let content: string = '';
      const syPostFile: string = util.safeFile(`ApplySynonyms.sql`);
      synonyms.forEach(item => {
          const file: string = util.safeFile(`${item.schema}.${item.name}.sql`);

          if (!include(config.files, file)) {
              return;
          }

          content += script.synonym(item);
      });

      const dir: string = createSpecialFile(config, syPostFile, content, "synonyms");

      exclude(config, existing, dir);
  }

  if (fullTextIndexes.length > 0) {
      let content: string = '';
      const ftPostFile: string = util.safeFile(`ApplyFullTextIndexes.sql`);
      fullTextIndexes.forEach(item => {
          const file: string = util.safeFile(`${item.scheme}.${item.table_name}.sql`);

          if (!include(config.files, file)) {
              return;
          }

          content += script.fullTextIndex(item);
      });

      const dir: string = createSpecialFile(config, ftPostFile, content, "ft-index");

      exclude(config, existing, dir);
  }

  // all remaining files in `existing` need deleted
  removeFiles(existing);
}

/**
 * Write SQL file script to the file system with correct options.
 *
 * @param config Current configuration to use.
 * @param item Row from query.
 * @param file Name of file to create.
 * @param content Script file contents.
 */
function createFile(config: Config, item: any, file: string, content: string): string {
  let dir: string;
  let output: string;
  let type: IdempotencyOption;

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

function createPrepFile(config: Config, file: string, content: string) {
    let dir: string;
    let output: string = config.output.prep;
    
    if (output) {
        // get full output path
        dir = path.join(config.output.root, output, file);
        
        // create file
        console.log(`Creating ${chalk.cyan(dir)} ...`);
        fs.outputFileSync(dir, content.trim());
    }

    return dir;
}

function createSpecialFile(config: Config, file: string, content: string, type: string) {
    let dir: string;
    let output: string;

    switch (type) {
        case ("constraint"):
            output = config.output.constraints;
            break;
        case ("fk"):
            output = config.output.foreignKeys;
            break;
        case ("ft-catalog"):
            output = config.output['ft-catalog'];
            break;
        case ("ft-stoplist"):
            output = config.output['ft-stoplist'];
            break;
        case ("synonyms"):
            output = config.output.synonyms;
            break;
        case ("ft-index"):
            output = config.output['ft-index'];
            break;
        case ("update-table"):
            output = config.output.tables;
            break;
    };

    if (output) {
        // get full output path
        dir = path.join(config.output.root, output, file);

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
function include(files: string[], file: string | string[]): boolean {
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
function exclude(config: Config, existing: string[], dir: string): void {
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
function removeFiles(files: string[]): void {
  files.forEach(file => {
    console.log(`Removing ${chalk.cyan(file)} ...`);
    fs.removeSync(file);
  });
}

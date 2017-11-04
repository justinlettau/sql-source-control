import chalk from 'chalk';
import * as fs from 'fs-extra';
import * as glob from 'glob';
import * as multimatch from 'multimatch';
import * as path from 'path';
import * as sql from 'mssql';
import { isArray } from 'ts-util-is';

import { Config } from '../common/config';
import { Connection } from '../common/connection';
import { IdempotencyOption } from '../common/idempotency';
import * as script from '../sql/script';
import {
    ColumnRecordSet,
    ForeignKeyRecordSet,
    IndexRecordSet,
    ObjectRecordSet,
    PrimaryKeyRecordSet,
    SchemaRecordSet,
    TableRecordSet
} from '../sql/record-set';
import {
    columnRead,
    foreignKeyRead,
    indexRead,
    objectRead,
    primaryKeyRead,
    tableRead
} from '../sql/sys';
import * as util from '../common/utility';
// import { context } from '../commands/context';

/**
 * Generate SQL files for all tables, stored procedures, functions, etc.
 *
 * @param name Connection name to use.
 */
export function pull(name: string): void {
    const start: [number, number] = process.hrtime();
    const config: Config = util.getConfig();
    let conn: Connection ;

    if ( name !== '' ) {
        conn = util.getConn(config, name);

    } else
    if ((context !== '') || ( name === '' )) {
        conn = util.getConn(config, context);
    } else {
        console.log(chalk.red('context is need to set with "use"  '));
        return;
    }
    console.log(`Pulling ${chalk.magenta(conn.database)} from [${chalk.magenta(conn.name)}]${chalk.magenta(conn.server)} ...`);

    // connect to db
    new sql.ConnectionPool(conn)
        .connect()
        .then((pool: sql.ConnectionPool): Promise<sql.IResult<any>[]> => {
            return Promise.all([
                pool.request().query(objectRead),
                pool.request().query(tableRead),
                pool.request().query(columnRead),
                pool.request().query(primaryKeyRead),
                pool.request().query(foreignKeyRead),
                pool.request().query(indexRead)
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
function scriptFiles(config: Config, results: sql.IResult<any>[]): void {
    const existing: string[] = glob.sync(`${config.output.root}/**/*.sql`);

    // note: array order MUST match query promise array
    const objects: ObjectRecordSet[] = results[0].recordset;
    const tables: TableRecordSet[] = results[1].recordset;
    const columns: ColumnRecordSet[] = results[2].recordset;
    const primaryKeys: PrimaryKeyRecordSet[] = results[3].recordset;
    const foreignKeys: ForeignKeyRecordSet[] = results[4].recordset;
    const indexes: IndexRecordSet[] = results[5].recordset;

    // get unique schema names
    const schemas: SchemaRecordSet[] = tables.map(item => {
        return { name: item.schema, type: 'SCHEMA' };
    });

    // write files for schemas
    for (const item of schemas) {
        const file: string = util.safeFile(`${item.name}.sql`);

        if (!include(config, file)) {
            continue;
        }
        const content: string = script.schema(item);
        const dir: string = createFile(config, item, file, content);
        exclude(existing, dir);
    }

    // write files for stored procedures, functions, ect.
    for (const item of objects) {
        const file: string = util.safeFile(`${item.schema}.${item.name}.sql`);

        if (!include(config, file)) {
            continue;
        }

        const dir: string = createFile(config, item, file, item.text);
        exclude(existing, dir);
    }

    // write files for tables
    for (const item of tables) {
        const file: string = util.safeFile(`${item.schema}.${item.name}.sql`);

        if (!include(config, file)) {
            continue;
        }

        const content: string = script.table(item, columns, primaryKeys, foreignKeys, indexes);
        const dir: string = createFile(config, item, file, content);
        exclude(existing, dir);
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
        default:
            output = 'unknown';
    }

    // get full output path
    dir = path.join(config.output.root, output, file);

    // idempotent prefix
    content = script.idempotency(item, type) + content;

    // create file
    console.log(`Creating '${chalk.cyan(dir)}' ...`);
    fs.outputFileSync(dir, content.trim());

    return dir;
}

/**
 * Check if a file passes the `files` glob pattern.
 *
 * @param config Current configuration to use.
 * @param file File path to check.
 */
function include(config: Config, file: string | string[]): boolean {
    if (!config.files || !config.files.length) {
        return true;
    }

    if (!isArray(file)) {
        file = [file];
    }

    const results: string[] = multimatch(file, config.files);
    return !!results.length;
}

/**
 * Remove `dir` from `existing` if it exists.
 *
 * @param existing Collection of file paths to check against.
 * @param dir File path to check.
 */
function exclude(existing: string[], dir: string): void {
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
    for (const file of files) {
        console.log(`Removing '${chalk.cyan(file)}' ...`);
        fs.removeSync(file);
    }
}

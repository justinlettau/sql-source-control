import * as chalk from 'chalk';
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
import { objects } from 'inquirer';
import { equal } from 'assert';
import { forEachComment } from 'tslint';
import { context } from '../commands/context';

/**
 * Generate SQL files for sql query data.
 * @param sqlSelect
 * @param outputfilename
 */
export function sql2file(sqlSelect: string, outputfilename: string): void {
    const start: [number, number] = process.hrtime();
    const config: Config = util.getConfig();
    let conn: Connection ;
    if (context !== '') {
        conn = util.getConn(config, context);
    } else {
        console.log(chalk.red('context is need to set with "use" '));
        return;
    }
    // connect to db
    new sql.ConnectionPool(conn)
        .connect()
        .then((pool: sql.ConnectionPool): Promise<sql.IResult<any>[]> => {
            return Promise.all([
                pool.request().query(sqlSelect)
            ]).then(results => {
                pool.close();
                return results;
            });
        })// write files for tables
        .then(results => {
            resultsetTofiles(config, results, outputfilename); })
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
 * @param filename out file name
 */
function resultsetTofiles(config: Config, results: sql.IResult<any>[], filename: string ): void {
    const columns: any[] = [];
    const contenttext: any[] = [];

    for (const obj in results[0].recordset.columns) {
        if (false !== false) {
            columns.push('\t' + obj);
        } else {
            columns.push('\t' + obj);
            contenttext.push('\t' + obj);
        }
    }
    // combine content of table
    for (const row of results[0].recordset) {
        contenttext.push('\n');
        for (const col of columns) {
            contenttext.push(row[col.replace('\t', '')] + '\t' );
        }
    }

    if (contenttext.length > 0) {
        let dir: string;
        // get full output path
        dir = path.join(config.output.root, filename);
        // create file
        console.log(`Creating '${chalk.cyan(dir)}' `);
        fs.outputFileSync(dir, contenttext.join('').trim());
        console.log(`Create success '${chalk.cyan(dir)}' `);
    }

}

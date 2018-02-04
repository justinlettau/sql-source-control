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

    const files: string[] = util.getFilesOrdered(config);
    let promise: Promise<sql.ConnectionPool> = new sql.ConnectionPool(conn).connect();

    for (const file of files) {
        console.log(`Executing ${chalk.cyan(file)} ...`);

        const content: string = fs.readFileSync(file, 'utf8');
        const statements: string[] = content.split('go' + EOL);

        for (const statement of statements) {
            promise = promise.then(pool => {
                return pool.request().batch(statement).then(result => pool);
            });
        }
    }

    promise
        .then(() => {
            const time: [number, number] = process.hrtime(start);
            console.log(chalk.green(`Finished after ${time[0]}s!`));
        })
        .catch(err => console.error(err));
}

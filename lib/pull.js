const chalk = require('chalk');
const fs = require('fs-extra');
const glob = require('glob');
const multimatch = require('multimatch');
const path = require('path');
const sql = require('mssql');
const script = require('./script');
const sys = require('./sys');
const util = require('./utility');

let config;
let existing;

module.exports = () => {
    const start = process.hrtime();

    // get configuration
    config = util.getConfig();
    existing = glob.sync(`${config.output.root}/**/*.sql`);

    console.log(`Pulling ${chalk.magenta(config.connection.database)} from ${chalk.magenta(config.connection.server)} ...`);

    // connect to db
    const conn = sql.connect(config.connection).then((pool) => {
        Promise.all([
            pool.request().query(sys.objects),
            pool.request().query(sys.tables),
            pool.request().query(sys.columns),
            pool.request().query(sys.primaryKeys),
            pool.request().query(sys.foreignKeys),
            pool.request().query(sys.indexes)
        ]).then(([objects, tables, columns, primaryKeys, foreignKeys, indexes]) => {
            const objectSet = objects.recordset;
            const tableSet = tables.recordset;
            const columnSet = tables.recordset;
            const primaryKeySet = tables.recordset;
            const foreignKeySet = tables.recordset;
            const indexSet = tables.recordset;

            // scripts for procs, functions, triggers, etc
            for (let item of objectSet) {
                item.type = item.type.trim();
                const file = util.safeFile(`${item.schema}.${item.name}.sql`);

                if (!include(file)) {
                    continue;
                }

                createFile(item, file, item.text);
            }

            // scripts for tables
            for (let item of tableSet) {
                item.type = item.type.trim();
                const file = util.safeFile(`${item.schema}.${item.name}.sql`);

                if (!include(file)) {
                    continue;
                }

                const content = script.table(item, columnSet, primaryKeySet, foreignKeySet, indexSet);
                createFile(item, file, content);
            }

            // all remaining files in `existing` need deleted
            for (let file of existing) {
                console.log(`Removing '${chalk.cyan(file)}' ...`);
                fs.removeSync(file);
            }
        }).then(() => {
            const time = process.hrtime(start);
            console.log(chalk.green(`Finished after ${time[0]}s!`));
        }).catch((err) => {
            console.error(err);
        });
    });
};

/**
 * Write SQL file script to the file system with correct options.
 *
 * @param item Row from query.
 * @param file Name of file to create.
 * @param content Script file contents.
 */
function createFile(item, file, content) {
    let dir;
    let output;
    let type;
    let index;

    switch (item.type) {
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

    // check if file exists
    index = existing.indexOf(dir.replace(/\\/g, '/'));

    if (index !== -1) {
        existing.splice(index, 1);
    }

    // idempotent prefix
    content = script.idempotency(item, type) + content;

    // create file
    console.log(`Creating '${chalk.cyan(dir)}' ...`);
    fs.outputFileSync(dir, content);
}

/**
 * Check if a file passes the `files` glob pattern.
 *
 * @param file Path and file name of script to check.
 * @returns True if the script should be included.
 */
function include(file) {
    if (!config.files || !config.files.length) {
        return true;
    }

    const results = multimatch(file, config.files);
    return !!results.length;
}

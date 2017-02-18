const fs = require('fs-extra');
const glob = require('glob');
const minimatch = require('minimatch');
const path = require('path');
const sql = require('mssql');
const script = require('./script');
const sys = require('./sys');
const util = require('./utility');

const config = util.getConfig();
const existing = glob.sync(`${config.output.root}/**/*.sql`);

module.exports = function () {

    // connect to db
    let conn = new sql.Connection(config, (err) => {
        if (err) {
            return console.error(err);
        }

        Promise.all([
            new sql.Request(conn).query(sys.objects),
            new sql.Request(conn).query(sys.tables),
            new sql.Request(conn).query(sys.columns),
            new sql.Request(conn).query(sys.primaryKeys),
            new sql.Request(conn).query(sys.forgeinKeys),
            new sql.Request(conn).query(sys.indexes)
        ]).then(([objects, tables, columns, primaryKeys, forgeinKeys, indexes]) => {

            // scripts for procs, functions, triggers, etc
            for (let item of objects) {
                item.type = item.type.trim();
                let file = util.safeFile(`${item.schema}.${item.name}.sql`);

                if (!include(file)) {
                    continue;
                }

                createFile(item, file, item.text);
            }

            // scripts for tables
            for (let item of tables) {
                item.type = item.type.trim();
                let file = util.safeFile(`${item.schema}.${item.name}.sql`);

                if (!include(file)) {
                    continue;
                }

                let content = script.table(item, columns, primaryKeys, forgeinKeys, indexes);
                createFile(item, file, content);
            }

            // all remaining files in `existing` need deleted
            for (let file of existing) {
                console.log(`Removing ${file} ...`);
                fs.removeSync(file);
            }
        }).then(() => {
            conn.close();
            console.log('All done!');
        }).catch((err) => {
            conn.close();
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
            type = config.idempotency.trigggers;
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
    console.log(`Creating ${dir} ...`);
    fs.outputFileSync(dir, content);
}

/**
 * Check if a file passes the `include` and `exclude` glob pattern.
 *
 * @param file Path and file name of script to check.
 * @returns True if the script should be included.
 */
function include(file) {
    if (config.include) {
        if (!minimatch(file, config.include)) {
            return false;
        }
    }

    if (config.exclude) {
        if (minimatch(file, config.exclude)) {
            return false;
        }
    }

    return true;
}

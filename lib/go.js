const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const minimatch = require('minimatch');
const sql = require('mssql');
const util = require('./utility');

module.exports = function () {
    const config = util.getConfig();
    let count = 0;

    // connect to db
    let conn = new sql.Connection(config, (err) => {
        if (err) {
            return console.error(err);
        }

        new sql.Request(conn)
            .query(`
               select
                   so.name
                   ,s.name as [schema]
                   ,rtrim(so.type) as [type]
                   ,stuff
                   (
                       (
                           select
                               cast(sc_inner.text as varchar(max))
                           from
                               sysobjects so_inner
                               inner join syscomments sc_inner on sc_inner.id = so_inner.id
                           where
                               so_inner.name = so.name
                           for xml path(''), type
                       ).value('(./text())[1]', 'varchar(max)')
                       ,1
                       ,0
                       ,''
                   ) as [text]
               from
                   sys.objects so
                   inner join syscomments sc on sc.id = so.object_id and so.type in ('P', 'V', 'TF', 'FN', 'TR')
                   inner join sys.schemas s on s.schema_id = so.schema_id
               group by
                   so.name
                   ,s.name
                   ,so.type
           `)
            .then((data) => {
                let existing = glob.sync(`${config.output.root}/**/*.sql`);

                // create each function, view, proc, etc as a seperate file
                for (let row of data) {
                    let file;
                    let dir;
                    let subdir;
                    let index;
                    let prefix;
                    let idempotentType;

                    // replace special charaters
                    row.name = row.name.replace(/\//g, '_');

                    // include schema and fiile extension
                    file = `${row.schema}.${row.name}.sql`;

                    if (config.include) {
                        if (!minimatch(file, config.include)) {
                            continue;
                        }
                    }

                    if (config.exclude) {
                        if (minimatch(file, config.exclude)) {
                            continue;
                        }
                    }

                    // create sub-directories
                    switch (row.type) {
                        case 'P':
                            subdir = config.output.procs;
                            idempotentType = config.idempotency.procs;
                            break;
                        case 'V':
                            subdir = config.output.views;
                            idempotentType = config.idempotency.views;
                            break;
                        case 'TF':
                            subdir = config.output['table-valued'];
                            idempotentType = config.idempotency['table-valued'];
                            break;
                        case 'FN':
                            subdir = config.output['scalar-valued'];
                            idempotentType = config.idempotency['scalar-valued'];
                            break;
                        case 'TR':
                            subdir = config.output.triggers;
                            idempotentType = config.idempotency.trigggers;
                            break;
                        default:
                            subdir = 'unknown';
                    }

                    dir = path.join(config.output.root, subdir, file);
                    console.log(`Creating ${dir} ...`);

                    index = existing.indexOf(dir.replace(/\\/g, '/'));
                    if (index !== -1) {
                        // no need to delete
                        existing.splice(index, 1);
                    }

                    // add optional idempotent prefix
                    prefix = getIdempotency(row, idempotentType);
                    row.text = prefix + row.text;

                    // create file
                    fs.outputFileSync(dir, row.text);
                    count++;
                }

                // all remaining files in `existing` need deleted
                for (let file of existing) {
                    console.log(`Removing ${file} ...`);
                    fs.removeSync(file);
                }

            }).then(() => {
                conn.close();

                if (count) {
                    console.log('SQL scripts created successfully!');
                } else {
                    console.log('No SQL objects found to create.');
                }
            }).catch((err) => {
                conn.close();
                console.error(err);
            });

    });

};

/**
 * Get idempotency script prefix.
 *
 * @param row SQL record containing object information.
 * @param idempotentType Type of idempotent script to add.
 * @returns Idempotent script prefix.
 */
function getIdempotency(row, idempotentType) {
    let prefix = '';

    if (!idempotentType) {
        return prefix;
    }

    if (idempotentType === 'if-exists-drop') {
        // if exists drop
        prefix = [
            `if exists (select * from sys.objects where object_id = object_id('[${row.schema}].[${row.name}]') and type = '${row.type}')`,
            `drop procedure [${row.schema}].[${row.name}]`,
            `go`,
            `\n`
        ].join('\n');
    } else if (idempotentType === 'if-not-exists') {
        // if not exists
        prefix = `if not exists (select * from sys.objects where object_id = object_id('[${row.schema}].[${row.name}]') and type = '${row.type}')\n`;
    }

    return prefix;
}

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
                   inner join syscomments sc on sc.id = so.object_id and so.type in ('P', 'V', 'TF', 'FN')
                   inner join sys.schemas s on s.schema_id = so.schema_id
               group by
                   so.name
                   ,s.name
                   ,so.type
           `)
            .then((data) => {
                let existing = glob.sync(`${util.sourceDir}/**/*.sql`);

                // create each function, view, proc, etc as a seperate file
                for (let row of data) {
                    let file;
                    let dir;
                    let subdir;
                    let index;

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
                            subdir = 'stored-procedures';
                            break;
                        case 'V':
                            subdir = 'views';
                            break;
                        case 'TF':
                            subdir = 'functions/table-valued';
                            break;
                        case 'FN':
                            subdir = 'functions/scalar-valued';
                            break;
                        default:
                            subdir = 'unknown';
                    }

                    dir = path.join(util.sourceDir, subdir, file);
                    console.log(`Creating ${dir} ...`);

                    index = existing.indexOf(dir.replace(/\\/g, '/'));
                    if (index !== -1) {
                        // no need to delete
                        existing.splice(index, 1);
                    }

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
                    console.log('SQL go complete!');
                } else {
                    console.log('No SQL files found.');
                }
            }).catch((err) => {
                conn.close();
                console.error(err);
            });

    });

};

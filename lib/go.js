const fs = require('fs-extra');
const path = require('path');
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
                    s.name as [schema],
                    so.name,
                    sc.text,
                    rtrim(so.type) as type
                from
                    sys.objects so
                    inner join syscomments sc on sc.id = so.object_id and so.type in ('P', 'V', 'T', 'F', 'TF', 'FN')
                    inner join sys.schemas s on s.schema_id = so.schema_id
            `)
            .then((data) => {

                // create each function, view, proc, etc as a seperate file
                for (let row of data) {
                    let file;
                    let dir;
                    let subdir;

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
                    console.log(`Creating ${dir}`);

                    // create file
                    fs.outputFileSync(dir, row.text);
                    count++;
                }
            }).then(() => {
                conn.close();

                if (count) {
                    console.log('SQL files created!');
                } else {
                    console.log('No SQL files found.');
                }
            }).catch((err) => {
                conn.close();
                console.error(err);
            });

    });

};

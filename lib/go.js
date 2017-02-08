const fs = require('fs-extra');
const path = require('path');
const sql = require('mssql');
const util = require('./utility');

module.exports = function () {
    const config = util.getConfig();

    // connect to db
    let conn = new sql.Connection(config, (err) => {
        if (err) {
            return console.error(err);
        }

        new sql.Request(conn)
            .query(`
                select
                    so.name,
                    sc.text,
                    rtrim(so.type) as type
                from
                    sysobjects so
                    inner join syscomments sc on sc.id = so.id and so.type in ('P', 'V', 'T', 'F', 'TF', 'FN')
            `)
            .then((data) => {

                // create each function, view, proc, etc as a seperate file
                for (let row of data) {
                    let file = row.name.replace(/\//g, '_') + '.sql';
                    let dir;
                    let subdir;

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
                        case 'F':
                        case 'T':
                            subdir = 'functions';
                            break;
                        default:
                            subdir = 'unknown';
                    }

                    dir = path.join(util.sourceDir, subdir, file);
                    console.log(`Creating ${dir}`);

                    // create file
                    fs.outputFileSync(dir, row.text);
                }
            }).then(() => {
                conn.close();
                console.log('SQL files created!');
            }).catch((err) => {
                conn.close();
                console.error(err);
            });

    });

};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pkg = require("../package.json");
var program = require("commander");
var cat_1 = require("./commands/cat");
var pull_1 = require("./commands/pull");
var init_1 = require("./commands/init");
var sql2file_1 = require("./commands/sql2file");
var context_1 = require("./commands/context");
var context_2 = require("./commands/context");
program
    .command('init')
    .description('Create default config file.')
    .option('-f, --force', 'Overwrite existing config file, if present.')
    .option('-s, --skip', 'Use defaults only and skip the option prompts.')
    .action(init_1.init);
program
    .command('use [name]')
    .description('use which connection.')
    .action(context_1.use);
program
    .command('show [name]')
    .description('list specific connection informations.if [name] not give,show all')
    .action(context_2.show);
program
    .command('pull [name]')
    .description('Generate SQL files for all tables, stored procedures, functions, etc.')
    .action(pull_1.pull);
program
    .command('cat')
    .description('Concatenate all SQL files into a single file.')
    .action(cat_1.cat);
program
    .command('sf [sql] [file]')
    .description('Create data file from sql text.')
    .action(sql2file_1.sql2file);
program
    .version(pkg.version)
    .parse(process.argv);
//# sourceMappingURL=index.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pkg = require('../package.json');
var program = require("commander");
var pull_1 = require("./commands/pull");
var init_1 = require("./commands/init");
program
    .command('init')
    .description('Create default config file.')
    .option('-f, --force', 'Overwrite existing config file, if present.')
    .option('-s, --skip', 'Use defaults only and skip the option prompts.')
    .option('-w, --webconfig [value]', 'Relative path to Web.config file.')
    .action(init_1.init);
program
    .command('pull [name]')
    .description('Generate SQL files for all tables, stored procedures, functions, etc.')
    .action(pull_1.pull);
program
    .version(pkg.version)
    .parse(process.argv);
//# sourceMappingURL=index.js.map
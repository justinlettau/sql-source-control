"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var program = require("commander");
var updateNotifier = require("update-notifier");
var pkg = require("../package.json");
var cat_1 = require("./commands/cat");
var conns_1 = require("./commands/conns");
var init_1 = require("./commands/init");
var pull_1 = require("./commands/pull");
var push_1 = require("./commands/push");
// check for updates
updateNotifier({ pkg: pkg }).notify();
program
    .command('init')
    .description('Create default config file.')
    .option('-f, --force', 'Overwrite existing config file, if present.')
    .option('-s, --skip', 'Use defaults only and skip the option prompts.')
    .option('-w, --webconfig [value]', 'Relative path to Web.config file.')
    .action(init_1.init);
program
    .command('conns')
    .description('List all available connections.')
    .action(conns_1.conns);
program
    .command('pull [name]')
    .description('Generate SQL files for all tables, stored procedures, functions, etc.')
    .action(pull_1.pull);
program
    .command('push [name]')
    .description('Execute all scripts against the requested database.')
    .action(push_1.push);
program
    .command('cat')
    .description('Concatenate all SQL files into a single file.')
    .action(cat_1.cat);
program
    .version(pkg.version)
    .parse(process.argv);
//# sourceMappingURL=index.js.map
const pkg = require('../package.json');
import * as program from 'commander';

import { pull } from './commands/pull';
import { init } from './commands/init';

program
    .command('init')
    .description('Create default config file.')
    .option('-f, --force', 'Overwrite existing config file, if present.')
    .option('-s, --skip', 'Use defaults only and skip the option prompts.')
    .option('-w, --webconfig [value]', 'Relative path to Web.config file.')
    .action(init);

program
    .command('pull')
    .description('Generate SQL files for all tables, stored procedures, functions, etc.')
    .action(pull);

program
    .version(pkg.version)
    .parse(process.argv);

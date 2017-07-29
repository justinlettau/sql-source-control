import pkg = require('../package.json');
import * as program from 'commander';

import { cat } from './commands/cat';
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
    .command('pull [name]')
    .description('Generate SQL files for all tables, stored procedures, functions, etc.')
    .action(pull);

program
    .command('cat')
    .description('Concatenate all SQL files into a single file.')
    .action(cat);

program
    .version((pkg as any).version)
    .parse(process.argv);

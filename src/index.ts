import pkg = require('../package.json');
import * as program from 'commander';

import { cat } from './commands/cat';
import { pull } from './commands/pull';
import { init } from './commands/init';
import { sql2file } from './commands/sql2file';
import { use } from './commands/context';
import { show } from './commands/context';
import defineProperty = Reflect.defineProperty;
import getPrototypeOf = Reflect.getPrototypeOf;

program
    .command('init')
    .description('Create default config file.')
    .option('-f, --force', 'Overwrite existing config file, if present.')
    .option('-s, --skip', 'Use defaults only and skip the option prompts.')
    .action(init);

program
    .command('use [name]')
    .description('use which connection.')
    .action(use);

program
    .command('show [name]')
    .description('list specific connection informations.if [name] not give,show all')
    .action(show);

program
    .command('pull [name]')
    .description('Generate SQL files for all tables, stored procedures, functions, etc.')
    .action(pull);

program
    .command('cat')
    .description('Concatenate all SQL files into a single file.')
    .action(cat);

program
    .command('sf [sql] [file]')
    .description('Create data file from sql text.')
    .action(sql2file);

program
    .version((pkg as any).version)
    .parse(process.argv);

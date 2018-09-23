import * as program from 'commander';
import * as updateNotifier from 'update-notifier';

import pkg = require('../package.json');
import { Cat } from './commands/cat';
import { Conns } from './commands/conns';
import { Init } from './commands/init';
import { Pull } from './commands/pull';
import { Push } from './commands/push';

// check for updates
updateNotifier({ pkg }).notify();

program
  .command('init')
  .description('Create default config file.')
  .option('-f, --force', 'Overwrite existing config file, if present.')
  .option('-s, --skip', 'Use defaults only and skip the option prompts.')
  .option('-w, --webconfig [value]', 'Relative path to Web.config file.')
  .action(options => {
    const action: Init = new Init();
    action.invoke(options);
  });

program
  .command('conns')
  .description('List all available connections.')
  .action(() => {
    const action: Conns = new Conns();
    action.invoke();
  });

program
  .command('pull [name]')
  .description('Generate SQL files for all tables, stored procedures, functions, etc.')
  .option('-c, --config [value]', 'Relative path to config file.')
  .action((name, options) => {
    const action: Pull = new Pull();
    action.invoke(name, options);
  });

program
  .command('push [name]')
  .description('Execute all scripts against the requested database.')
  .action(name => {
    const action: Push = new Push();
    action.invoke(name);
  });

program
  .command('cat')
  .description('Concatenate all SQL files into a single file.')
  .action(() => {
    const action: Cat = new Cat();
    action.invoke();
  });

program
  .version((pkg as any).version)
  .parse(process.argv);

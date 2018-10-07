import * as program from 'commander';
import * as updateNotifier from 'update-notifier';

import pkg = require('../package.json');
import Init from './commands/init';
import List from './commands/list';
import Pull from './commands/pull';
import Push from './commands/push';

// check for updates
updateNotifier({ pkg }).notify();

program
  .command('init')
  .description('Create default config file.')
  .option('-f, --force', 'Overwrite existing config file, if present.')
  .option('-s, --skip', 'Use defaults only and skip the option prompts.')
  .option('-w, --webconfig [value]', 'Relative path to Web.config file.')
  .action(options => {
    const action: Init = new Init(options);
    action.invoke();
  });

program
  .command('list')
  .alias('ls')
  .description('List all available connections.')
  .action(() => {
    const action: List = new List();
    action.invoke();
  });

program
  .command('pull [name]')
  .description('Generate SQL files for all tables, stored procedures, functions, etc.')
  .option('-c, --config [value]', 'Relative path to config file.')
  .action((name, options) => {
    const action: Pull = new Pull(name, options);
    action.invoke();
  });

program
  .command('push [name]')
  .description('Execute all scripts against the requested database.')
  .option('-s, --skip', 'Skip user warning prompt.')
  .action((name, options) => {
    const action: Push = new Push(name, options);
    action.invoke();
  });

program
  .version((pkg as any).version)
  .parse(process.argv);

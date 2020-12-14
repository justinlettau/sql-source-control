import * as program from 'commander';
import * as updateNotifier from 'update-notifier';

import pkg = require('../package.json');
import Init from './commands/init';
import List from './commands/list';
import Pull from './commands/pull';
import Push from './commands/push';

async function main() {
  program
    .command('init')
    .description('Create default config file.')
    .option('-f, --force', 'Overwrite existing config file, if present.')
    .option('-s, --skip', 'Use defaults only and skip the option prompts.')
    .option('-w, --webconfig [value]', 'Relative path to Web.config file.')
    .action((options) => {
      const action = new Init(options);
      return action.invoke();
    });

  program
    .command('list')
    .alias('ls')
    .description('List all available connections.')
    .option('-c, --config [value]', 'Relative path to config file.')
    .action((options) => {
      const action = new List(options);
      return action.invoke();
    });

  program
    .command('pull [name]')
    .description(
      'Generate SQL files for all tables, stored procedures, functions, etc.'
    )
    .option('-c, --config [value]', 'Relative path to config file.')
    .action((name, options) => {
      const action = new Pull(name, options);
      return action.invoke();
    });

  program
    .command('push [name]')
    .description('Execute all scripts against the requested database.')
    .option('-c, --config [value]', 'Relative path to config file.')
    .option('-s, --skip', 'Skip user warning prompt.')
    .action((name, options) => {
      const action = new Push(name, options);
      return action.invoke();
    });

  program.version((pkg as any).version);
  await program.parseAsync(process.argv);
}

// init
updateNotifier({ pkg } as any).notify();
main();

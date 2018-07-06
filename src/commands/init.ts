import * as fs from 'fs-extra';
import * as inquirer from 'inquirer';

import { Connection } from '../common/connection';
import * as util from '../common/utility';

/**
 * CLI arguments for `init` command.
 */
interface InitOptions {
  webconfig?: string;
  force?: boolean;
  skip?: boolean;
}

/**
 * Connection path choices.
 */
enum PathChoices {
  SscConfig,
  ConnsConfig,
  WebConfig
}

/**
 * Create default config file.
 *
 * @param options CommanderJS options.
 */
export function init(options: InitOptions): void {
  const webConfigFile: string = options.webconfig || util.webConfigFile;
  const webConfigConns: Connection[] = util.getWebConfigConns(webConfigFile);
  const conn: Connection = new Connection();

  if (webConfigConns) {
    // use options from web config
    Object.assign(conn, webConfigConns[0]);
  }

  if (fs.existsSync(util.configFile) && !options.force) {
    // don't overwrite existing config file
    return console.error('Config file already exists!');
  }

  if (options.skip) {
    // skip prompts and create with defaults
    util.setConfig(util.configFile, { connections: options.webconfig || [conn] });
    return;
  }

  const questions: inquirer.Questions = [
    {
      name: 'path',
      message: 'Where would you like to store connections?',
      type: 'list',
      choices: () => {
        const choices: object[] = [
          { name: 'Main configuration file.', value: PathChoices.SscConfig },
          { name: 'Separate connections configuration file.', value: PathChoices.ConnsConfig }
        ];

        if (webConfigConns) {
          choices.push({
            name: 'Web.config file with connection strings.',
            value: PathChoices.WebConfig
          });
        }

        return choices;
      }
    },
    {
      name: 'server',
      message: 'Server URL.',
      default: (conn.server || undefined),
      when: answers => (answers.path !== PathChoices.WebConfig)
    },
    {
      name: 'port',
      message: 'Server port.',
      default: (conn.port || undefined),
      when: answers => (answers.path !== PathChoices.WebConfig)
    },
    {
      name: 'database',
      message: 'Database name.',
      default: (conn.database || undefined),
      when: answers => (answers.path !== PathChoices.WebConfig)
    },
    {
      name: 'user',
      message: 'Login username.',
      default: (conn.user || undefined),
      when: answers => (answers.path !== PathChoices.WebConfig)
    },
    {
      name: 'password',
      message: 'Login password.',
      type: 'password',
      default: (conn.password || undefined),
      when: answers => (answers.path !== PathChoices.WebConfig)
    },
    {
      name: 'name',
      message: 'Connection name.',
      default: 'dev',
      when: answers => (answers.path !== PathChoices.WebConfig)
    }
  ];

  // prompt user for config options
  inquirer.prompt(questions).then((answers: inquirer.Answers): void => {
    if (answers.path === PathChoices.WebConfig) {
      util.setConfig(util.configFile, { connections: webConfigFile });
    } else if (answers.path === PathChoices.ConnsConfig) {
      util.setConfig(util.configFile, { connections: './ssc-connections.json' });
      util.setConfig(util.connsFile, {
        connections: [new Connection({
          name: answers.name,
          server: answers.server,
          port: answers.port,
          database: answers.database,
          user: answers.user,
          password: answers.password,
          synonym_target: ""
        })]
      });
    } else {
      util.setConfig(util.configFile, {
        connections: [new Connection({
          name: answers.name,
          server: answers.server,
          port: answers.port,
          database: answers.database,
          user: answers.user,
          password: answers.password,
          synonym_target: ""
        })]
      });
    }
  });
}

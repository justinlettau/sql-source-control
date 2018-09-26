import * as inquirer from 'inquirer';

import Config from '../common/config';
import Connection from '../common/connection';
import { IConnection } from '../common/interfaces';
import { PathChoices } from './eums';
import { InitOptions } from './interfaces';

export default class Init {

  /**
   * Invoke action.
   *
   * @param options CLI options.
   */
  public invoke(options: InitOptions): void {
    const webConfigConns: Connection[] = Config.getConnectionsFromWebConfig(options.webconfig);
    const conn: Connection = new Connection();

    if (!options.force && Config.doesDefaultExist()) {
      // don't overwrite existing config file
      return console.error('Config file already exists!');
    }

    if (webConfigConns) {
      // use options from web config
      conn.loadFromObject(webConfigConns[0]);
    }

    if (options.skip) {
      // skip prompts and create with defaults
      Config.write({ connections: options.webconfig || [conn] });
      return;
    }

    inquirer.prompt(this.getQuestions(conn, !!webConfigConns))
      .then(answers => this.writeFiles(answers));
  }

  /**
   * Get all applicable questions.
   *
   * @param conn Connection object to use for default values.
   */
  private getQuestions(conn: Connection, showWebConfig: boolean): inquirer.Questions {
    return [
      {
        name: 'path',
        message: 'Where would you like to store connections?',
        type: 'list',
        choices: () => {
          const choices: object[] = [
            {
              name: 'Main configuration file.',
              value: PathChoices.SscConfig
            },
            {
              name: 'Separate connections configuration file.',
              value: PathChoices.ConnsConfig
            }
          ];

          if (showWebConfig) {
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
  }

  /**
   * From configuration files(s) based on answers.
   *
   * @param answers Answers from questions.
   */
  private writeFiles(answers: inquirer.Answers): void {
    const conn: IConnection = {
      name: answers.name,
      server: answers.server,
      port: answers.port,
      database: answers.database,
      user: answers.user,
      password: answers.password
    };

    if (answers.path === PathChoices.WebConfig) {
      Config.write({ connections: Config.defaultWebConfigFile });
    } else if (answers.path === PathChoices.ConnsConfig) {
      Config.write({ connections: Config.defaultConnectionsJsonFile });
      Config.write({ connections: [conn] }, Config.defaultConnectionsJsonFile);
    } else {
      Config.write({ connections: [conn] });
    }
  }
}

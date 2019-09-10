import * as inquirer from 'inquirer';

import Config from '../common/config';
import Connection from '../common/connection';
import { IConnection } from '../common/interfaces';
import { PathChoices } from './eums';
import { InitOptions } from './interfaces';

export default class Init {
  constructor(private options: InitOptions) {}

  /**
   * Invoke action.
   */
  invoke() {
    const webConfigConns = Config.getConnectionsFromWebConfig(this.options.webconfig);
    const conn = new Connection();

    if (!this.options.force && Config.doesDefaultExist()) {
      // don't overwrite existing config file
      return console.error('Config file already exists!');
    }

    if (webConfigConns) {
      // use options from web config
      conn.loadFromObject(webConfigConns[0]);
    }

    if (this.options.skip) {
      // skip prompts and create with defaults
      Config.write({ connections: this.options.webconfig || [conn] });
      return;
    }

    inquirer.prompt(this.getQuestions(conn, !!webConfigConns)).then(answers => this.writeFiles(answers));
  }

  /**
   * Get all applicable questions.
   *
   * @param conn Connection object to use for default values.
   */
  private getQuestions(conn: Connection, showWebConfig: boolean) {
    const questions: inquirer.QuestionCollection = [
      {
        choices: () => this.getPathChoices(showWebConfig),
        message: 'Where would you like to store connections?',
        name: 'path',
        type: 'list'
      },
      {
        default: conn.server || undefined,
        message: 'Server URL.',
        name: 'server',
        when: answers => answers.path !== PathChoices.WebConfig
      },
      {
        default: conn.port || undefined,
        message: 'Server port.',
        name: 'port',
        when: answers => answers.path !== PathChoices.WebConfig
      },
      {
        default: conn.database || undefined,
        message: 'Database name.',
        name: 'database',
        when: answers => answers.path !== PathChoices.WebConfig
      },
      {
        default: conn.user || undefined,
        message: 'Login username.',
        name: 'user',
        when: answers => answers.path !== PathChoices.WebConfig
      },
      {
        default: conn.password || undefined,
        message: 'Login password.',
        name: 'password',
        type: 'password',
        when: answers => answers.path !== PathChoices.WebConfig
      },
      {
        default: 'dev',
        message: 'Connection name.',
        name: 'name',
        when: answers => answers.path !== PathChoices.WebConfig
      }
    ];

    return questions;
  }

  /**
   * Get all available configuration file path choices.
   *
   * @param showWebConfig Indicates if Web.config choice should be available.
   */
  private getPathChoices(showWebConfig: boolean) {
    const choices: inquirer.ChoiceOptions[] = [
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

  /**
   * From configuration files(s) based on answers.
   *
   * @param answers Answers from questions.
   */
  private writeFiles(answers: inquirer.Answers) {
    const conn: IConnection = {
      database: answers.database,
      name: answers.name,
      password: answers.password,
      port: answers.port,
      server: answers.server,
      user: answers.user
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

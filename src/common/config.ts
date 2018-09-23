import * as fs from 'fs-extra';
import * as path from 'path';
import { isString } from 'ts-util-is';
import * as xml2js from 'xml2js';

import { Connection } from './connection';
import { IdempotencyConfig } from './idempotency';
import { OutputConfig } from './output';

/**
 * Configuration options.
 */
export class Config {

  /**
   * Default connections JSON file.
   */
  public static readonly defaultConnectionsJsonFile: string = 'ssc-connections.json';

  /**
   * Default Web.config file.
   */
  public static readonly defaultWebConfigFile: string = 'Web.config';

  /**
   * Default configuration file.
   */
  private static readonly defaultConfigFile: string = 'ssc.json';

  /**
   * Write a config file with provided configuration.
   *
   * @param config Configuration object to write.
   * @param file Configuration file to write to.
   */
  public static write(config: object, file?: string): void {
    const configFile: string = path.join(process.cwd(), file || Config.defaultConfigFile);
    const content: string = JSON.stringify(config, null, 2);

    fs.outputFile(configFile, content, (error: Error) => {
      if (error) {
        return console.error(error);
      }

      console.log('Config file created!');
    });
  }

  /**
   * Check if default configuration file exists.
   */
  public static doesDefaultExist(): boolean {
    return fs.existsSync(Config.defaultConfigFile);
  }

  /**
   * Safely get connections from a Web.config file.
   *
   * @param file Relative path to Web.config file.
   */
  public static getConnectionsFromWebConfig(file: string): Connection[] {
    const configFile: string = path.join(process.cwd(), file || Config.defaultWebConfigFile);
    const parser: xml2js.Parser = new xml2js.Parser();
    const conns: Connection[] = [];
    let content: string;

    console.log(configFile);

    if (!fs.existsSync(configFile)) {
      // not found, use defaults
      return;
    }

    content = fs.readFileSync(configFile, 'utf-8');

    parser.parseString(content, (err, result): void => {
      if (err) {
        console.error(err);
        process.exit();
      }

      try {
        const connectionStrings: any[] = result.configuration.connectionStrings[0].add;

        connectionStrings.forEach(item => {
          const conn: Connection = new Connection();
          conn.loadFromString(item.$.name, item.$.connectionString);
          conns.push(conn);
        });
      } catch (err) {
        console.error('Could not parse connection strings from Web.config file!');
        process.exit();
      }
    });

    return (conns.length ? conns : undefined);
  }

  constructor(file?: string) {
    this.load(file);
  }

  /**
   * Relative path to a `Web.config`, a file with an array of connections, or an array of connections
   */
  public connections: string | Connection[] = [];

  /**
   * Glob of files to include/exclude during the `pull` command.
   */
  public files: string[] = [];

  /**
   * List of table names to include for data scripting during the `pull` command.
   */
  public data: string[] = [];

  /**
   * Defines paths where files will be scripted during the `pull` command.
   */
  public output: OutputConfig = {
    'root': './_sql-database',
    'data': './data',
    'procs': './stored-procedures',
    'scalar-valued': './functions/scalar-valued',
    'schemas': './schemas',
    'table-valued': './functions/table-valued',
    'table-valued-parameters': './user-defined-types/table-valued-parameters',
    'tables': './tables',
    'triggers': './triggers',
    'views': './views'
  };

  /**
   * Defines what type of idempotency will scripted during the `pull` command.
   */
  public idempotency: IdempotencyConfig = {
    'procs': 'if-exists-drop',
    'scalar-valued': 'if-exists-drop',
    'table-valued': 'if-exists-drop',
    'table-valued-parameters': 'if-not-exists',
    'tables': 'if-not-exists',
    'triggers': 'if-exists-drop',
    'views': 'if-exists-drop'
  };

  /**
   * Get a connection by name, or the first available if `name` is not provided.
   *
   * @param name Optional connection `name` to get.
   */
  public getConnection(name?: string): Connection {
    const conns: Connection[] = this.getConnections();
    let conn: Connection;
    let error: string;

    if (name) {
      conn = conns.find(item => item.name.toLocaleLowerCase() === name.toLowerCase());
      error = `Could not find connection by name '${name}'!`;
    } else {
      conn = conns[0];
      error = 'Could not find default connection!';
    }

    if (!conn) {
      console.error(error);
      process.exit();
    }

    return conn;
  }

  /**
   * Safely get all connections.
   */
  public getConnections(): Connection[] {
    if (!isString(this.connections)) {
      return this.connections;
    }

    const configFile: RegExp = /\.config$/;

    if (configFile.test(this.connections)) {
      return Config.getConnectionsFromWebConfig(this.connections);
    } else {
      return this.getConnectionsFromJson(this.connections);
    }
  }

  /**
   * Load configuration options from file.
   *
   * @param file Configuration file to load.
   */
  private load(file?: string): void {
    const configFile: string = path.join(process.cwd(), file || Config.defaultConfigFile);

    try {
      const config: Config = fs.readJsonSync(configFile);

      this.connections = config.connections || this.connections;
      this.data = config.data || this.data;
      this.files = config.data || this.files;
      Object.assign(this.output, config.output);
      Object.assign(this.idempotency, config.idempotency);
    } catch (error) {
      console.error('Could not find or parse config file. You can use the `init` command to create one!');
      process.exit();
    }
  }

  /**
   * Safely get connections from a JSON file.
   *
   * @param file Relative path to connections JSON file.
   */
  private getConnectionsFromJson(file: string): Connection[] {
    const jsonFile: string = path.join(process.cwd(), file);

    try {
      const config: Config = fs.readJsonSync(jsonFile);
      return config.connections as Connection[];
    } catch (error) {
      console.error('Could not find or parse connections config file!');
      process.exit();
    }
  }
}

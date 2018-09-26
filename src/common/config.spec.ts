import * as mock from 'mock-fs';

import Config from './config';
import Connection from './connection';
import { IdempotencyConfig, OutputConfig } from './interfaces';

describe('Config class', () => {
  const name: string = 'dev';
  const server: string = 'localhost';
  const port: number = 1433;
  const database: string = 'awesome-db';
  const user: string = 'example';
  const password: string = 'qwerty';
  const connection: object = { name, server, port, database, user, password };
  const files: string[] = ['dbo.*'];
  const data: string[] = ['dbo.LookupTable'];
  const output: OutputConfig = { root: './my-database' };
  const idempotency: IdempotencyConfig = { triggers: false };

  describe('write method', () => {
    it('should write to default file', () => {
      // todo (jbl): error thrown with nyc
      // mock();

      // Config.write({
      //   connections: [connection]
      // });

      // const config: Config = new Config();
      // const conn: Connection = config.connections[0] as Connection;

      // expect(conn.name).toEqual(name);
      // expect(conn.server).toEqual(server);
      // expect(conn.port).toEqual(port);
      // expect(conn.database).toEqual(database);
      // expect(conn.user).toEqual(user);
      // expect(conn.password).toEqual(password);

      // mock.restore();
    });
  });

  describe('doesDefaultExist method', () => {
    it('should return true if file exists', () => {
      const file: string = Config.defaultConfigFile;

      mock({
        [file]: ''
      });

      const value: boolean = Config.doesDefaultExist();
      expect(value).toEqual(true);

      mock.restore();
    });
  });

  describe('doesDefaultExist method', () => {
    it('should return false if file not exists', () => {
      mock();

      const value: boolean = Config.doesDefaultExist();
      expect(value).toEqual(false);

      mock.restore();
    });
  });

  describe('getConnectionsFromWebConfig method', () => {
    it('should return connections if default web.config exists', () => {
      const file: string = Config.defaultWebConfigFile;

      mock({
        [file]: `
          <?xml version="1.0" encoding="utf-8"?>
          <configuration>
            <connectionStrings>
            <add
              name="${name}"
              connectionString="server=${server};database=${database};uid=${user};password=${password};" />
            </connectionStrings>
          </configuration>
        `
      });

      const conns: Connection[] = Config.getConnectionsFromWebConfig();
      const conn: Connection = conns[0];

      expect(conn.name).toEqual(name);
      expect(conn.server).toEqual(server);
      expect(conn.port).toBeUndefined();
      expect(conn.database).toEqual(database);
      expect(conn.user).toEqual(user);
      expect(conn.password).toEqual(password);

      mock.restore();
    });

    it('should return undefined if web.config not exists', () => {
      mock();

      const conns: Connection[] = Config.getConnectionsFromWebConfig();
      expect(conns).toBeUndefined();

      mock.restore();
    });
  });

  describe('constructor', () => {
    it('should load from default file', () => {
      const file: string = Config.defaultConfigFile;

      mock({
        [file]: JSON.stringify({
          connections: [connection],
          files,
          data,
          output,
          idempotency
        })
      });

      const config: Config = new Config();
      const conn: Connection = config.connections[0] as Connection;

      expect(conn.name).toEqual(name);
      expect(conn.server).toEqual(server);
      expect(conn.port).toEqual(port);
      expect(conn.database).toEqual(database);
      expect(conn.user).toEqual(user);
      expect(conn.password).toEqual(password);
      expect(config.files).toEqual(files);
      expect(config.data).toEqual(data);
      expect(config.output.root).toEqual(output.root);
      expect(config.idempotency.triggers).toEqual(idempotency.triggers);

      mock.restore();
    });

    it('should load from specified file', () => {
      const file: string = 'override-example.json';

      mock({
        [file]: JSON.stringify({
          connections: [connection],
          files,
          data,
          output,
          idempotency
        })
      });

      const config: Config = new Config(file);
      const conn: Connection = config.connections[0] as Connection;

      expect(conn.name).toEqual(name);
      expect(conn.server).toEqual(server);
      expect(conn.port).toEqual(port);
      expect(conn.database).toEqual(database);
      expect(conn.user).toEqual(user);
      expect(conn.password).toEqual(password);
      expect(config.files).toEqual(files);
      expect(config.data).toEqual(data);
      expect(config.output.root).toEqual(output.root);
      expect(config.idempotency.triggers).toEqual(idempotency.triggers);

      mock.restore();
    });
  });

  describe('getConnection method', () => {
    it('should return first connection', () => {
      const file: string = Config.defaultConfigFile;

      mock({
        [file]: JSON.stringify({
          connections: [connection]
        })
      });

      const config: Config = new Config();
      const conn: Connection = config.getConnection();

      expect(conn.name).toEqual(name);
      expect(conn.server).toEqual(server);
      expect(conn.port).toEqual(port);
      expect(conn.database).toEqual(database);
      expect(conn.user).toEqual(user);
      expect(conn.password).toEqual(password);

      mock.restore();
    });

    it('should return connection by name', () => {
      const file: string = Config.defaultConfigFile;

      mock({
        [file]: JSON.stringify({
          connections: [connection]
        })
      });

      const config: Config = new Config();
      const conn: Connection = config.getConnection(name);

      expect(conn.name).toEqual(name);
      expect(conn.server).toEqual(server);
      expect(conn.port).toEqual(port);
      expect(conn.database).toEqual(database);
      expect(conn.user).toEqual(user);
      expect(conn.password).toEqual(password);

      mock.restore();
    });
  });

  describe('getConnections method', () => {
    it('should return all conneections', () => {
      const file: string = Config.defaultConfigFile;

      mock({
        [file]: JSON.stringify({
          connections: [connection]
        })
      });

      const config: Config = new Config();
      const conns: Connection[] = config.getConnections();

      expect(conns.length).toEqual(1);

      mock.restore();
    });
  });
});

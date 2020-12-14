import * as mock from 'mock-fs';
import Config from './config';
import Connection from './connection';
import { IConnection, IdempotencyConfig, OutputConfig } from './interfaces';

describe('Config class', () => {
  const name = 'dev';
  const server = 'localhost';
  const port = 1433;
  const database = 'awesome-db';
  const user = 'example';
  const password = 'qwerty';
  const connection: IConnection = {
    database,
    name,
    password,
    port,
    server,
    user,
  };
  const files = ['dbo.*'];
  const data = ['dbo.LookupTable'];
  const output: OutputConfig = { root: './my-database' };
  const idempotency: IdempotencyConfig = { triggers: false };

  beforeEach(() => {
    mock.restore();
  });

  afterAll(() => {
    mock.restore();
  });

  describe('getRoot method', () => {
    it('should return default root path', () => {
      const file = Config.defaultConfigFile;

      mock({
        [file]: JSON.stringify({
          connections: [connection],
        }),
      });

      const config = new Config();
      const root = config.getRoot();

      expect(root).toEqual('./_sql-database');
    });

    it('should return override root path', () => {
      const file = 'override-example.json';

      mock({
        [file]: JSON.stringify({
          connections: [connection],
          output,
        }),
      });

      const config = new Config(file);
      const root = config.getRoot();

      expect(root).toEqual('./my-database');
    });

    it('should return relative path when no root provided', () => {
      const file = 'override-example.json';

      mock({
        [file]: JSON.stringify({
          connections: [connection],
          output: {
            root: '',
          },
        }),
      });

      const config = new Config(file);
      const root = config.getRoot();

      expect(root).toEqual('./');
    });

    it('should return relative path when "." provided', () => {
      const file = 'override-example.json';

      mock({
        [file]: JSON.stringify({
          output: {
            root: '.',
          },
        }),
      });

      const config = new Config(file);
      const root = config.getRoot();

      expect(root).toEqual('./');
    });
  });

  describe('write method', () => {
    it('should write to default file', () => {
      // todo (jbl): error thrown with nyc
      // mock();
      // Config.write({
      //   connections: [connection]
      // });
      // const config = new Config();
      // const conn = config.connections[0] as Connection;
      // expect(conn.name).toEqual(name);
      // expect(conn.server).toEqual(server);
      // expect(conn.port).toEqual(port);
      // expect(conn.database).toEqual(database);
      // expect(conn.user).toEqual(user);
      // expect(conn.password).toEqual(password);
    });
  });

  describe('doesDefaultExist method', () => {
    it('should return true if file exists', () => {
      const file = Config.defaultConfigFile;

      mock({
        [file]: '',
      });

      const value = Config.doesDefaultExist();
      expect(value).toEqual(true);
    });
  });

  describe('doesDefaultExist method', () => {
    it('should return false if file not exists', () => {
      mock({});

      let value: boolean;

      // https://github.com/tschaub/mock-fs/issues/256
      try {
        value = Config.doesDefaultExist();
      } catch (ex) {
        value = false;
      }

      expect(value).toEqual(false);
    });
  });

  describe('getConnectionsFromWebConfig method', () => {
    it('should return connections if default web.config exists', () => {
      const file = Config.defaultWebConfigFile;

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
        `,
      });

      const conns = Config.getConnectionsFromWebConfig();
      const conn = conns[0];

      expect(conn.name).toEqual(name);
      expect(conn.server).toEqual(server);
      expect(conn.port).toBeUndefined();
      expect(conn.database).toEqual(database);
      expect(conn.user).toEqual(user);
      expect(conn.password).toEqual(password);
    });

    it('should return undefined if web.config not exists', () => {
      mock();

      let conns: Connection[];

      // https://github.com/tschaub/mock-fs/issues/256
      try {
        conns = Config.getConnectionsFromWebConfig();
      } catch (ex) {
        conns = undefined;
      }

      expect(conns).toBeUndefined();
    });
  });

  describe('constructor', () => {
    it('should load from default file', () => {
      const file = Config.defaultConfigFile;

      mock({
        [file]: JSON.stringify({
          connections: [connection],
          data,
          files,
          idempotency,
          output,
        }),
      });

      const config = new Config();
      const conn = config.connections[0] as Connection;

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
    });

    it('should load from specified file', () => {
      const file = 'override-example.json';

      mock({
        [file]: JSON.stringify({
          connections: [connection],
          data,
          files,
          idempotency,
          output,
        }),
      });

      const config = new Config(file);
      const conn = config.connections[0] as Connection;

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
    });
  });

  describe('getConnection method', () => {
    it('should return first connection', () => {
      const file = Config.defaultConfigFile;

      mock({
        [file]: JSON.stringify({
          connections: [connection],
        }),
      });

      const config = new Config();
      const conn = config.getConnection();

      expect(conn.name).toEqual(name);
      expect(conn.server).toEqual(server);
      expect(conn.port).toEqual(port);
      expect(conn.database).toEqual(database);
      expect(conn.user).toEqual(user);
      expect(conn.password).toEqual(password);
    });

    it('should return connection by name', () => {
      const file = Config.defaultConfigFile;

      mock({
        [file]: JSON.stringify({
          connections: [connection],
        }),
      });

      const config = new Config();
      const conn = config.getConnection(name);

      expect(conn.name).toEqual(name);
      expect(conn.server).toEqual(server);
      expect(conn.port).toEqual(port);
      expect(conn.database).toEqual(database);
      expect(conn.user).toEqual(user);
      expect(conn.password).toEqual(password);
    });
  });

  describe('getConnections method', () => {
    it('should return all conneections', () => {
      const file = Config.defaultConfigFile;

      mock({
        [file]: JSON.stringify({
          connections: [connection],
        }),
      });

      const config = new Config();
      const conns = config.getConnections();

      expect(conns.length).toEqual(1);
    });
  });
});

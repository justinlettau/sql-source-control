import { Connection } from './connection';

describe('Connection class', () => {
  const name: string = 'dev';
  const server: string = 'localhost';
  const port: number = 1433;
  const database: string = 'awesome-db';
  const user: string = 'example';
  const password: string = 'qwerty';

  describe('loadFromString method', () => {
    it('should hydrate from string (format #1)', () => {
      const str: string = `server=${server};database=${database};uid=${user};password=${password};`;
      const conn: Connection = new Connection();
      conn.loadFromString(name, str);

      expect(conn.name).toEqual(name);
      expect(conn.server).toEqual(server);
      expect(conn.port).toBeUndefined();
      expect(conn.database).toEqual(database);
      expect(conn.user).toEqual(user);
      expect(conn.password).toEqual(password);
    });

    it('should hydrate from string (format #2)', () => {
      const str: string = `server=${server};database=${database};uid=${user};pwd=${password};`;
      const conn: Connection = new Connection();
      conn.loadFromString(name, str);

      expect(conn.name).toEqual(name);
      expect(conn.server).toEqual(server);
      expect(conn.port).toEqual(undefined);
      expect(conn.database).toEqual(database);
      expect(conn.user).toEqual(user);
      expect(conn.password).toEqual(password);
    });

    it('should hydrate from string with port', () => {
      const str: string = `server=${server},${port};database=${database};uid=${user};password=${password};`;
      const conn: Connection = new Connection();
      conn.loadFromString(name, str);

      expect(conn.name).toEqual(name);
      expect(conn.server).toEqual(server);
      expect(conn.port).toEqual(port);
      expect(conn.database).toEqual(database);
      expect(conn.user).toEqual(user);
      expect(conn.password).toEqual(password);
    });
  });

  describe('loadFromObject method', () => {
    it('should hydrate from object', () => {
      const conn: Connection = new Connection();
      conn.loadFromObject({
        name,
        server,
        port,
        database,
        user,
        password
      });

      expect(conn.name).toEqual(name);
      expect(conn.server).toEqual(server);
      expect(conn.port).toEqual(port);
      expect(conn.database).toEqual(database);
      expect(conn.user).toEqual(user);
      expect(conn.password).toEqual(password);
    });
  });
});

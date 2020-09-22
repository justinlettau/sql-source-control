import Connection from './connection';

describe('Connection class', () => {
  const name = 'dev';
  const server = 'localhost';
  const port = 1433;
  const database = 'awesome-db';
  const user = 'example';
  const password = 'qwerty';

  describe('loadFromString method', () => {
    it('should hydrate from string (format #1)', () => {
      const str = `server=${server};database=${database};uid=${user};password=${password};`;
      const conn = new Connection();
      conn.loadFromString(name, str);

      expect(conn.name).toEqual(name);
      expect(conn.server).toEqual(server);
      expect(conn.port).toBeUndefined();
      expect(conn.database).toEqual(database);
      expect(conn.user).toEqual(user);
      expect(conn.password).toEqual(password);
    });

    it('should hydrate from string (format #2)', () => {
      const str = `server=${server};database=${database};uid=${user};pwd=${password};`;
      const conn = new Connection();
      conn.loadFromString(name, str);

      expect(conn.name).toEqual(name);
      expect(conn.server).toEqual(server);
      expect(conn.port).toEqual(undefined);
      expect(conn.database).toEqual(database);
      expect(conn.user).toEqual(user);
      expect(conn.password).toEqual(password);
    });

    it('should hydrate from string with port', () => {
      const str = `server=${server},${port};database=${database};uid=${user};password=${password};`;
      const conn = new Connection();
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
      const conn = new Connection();
      conn.loadFromObject({
        database,
        name,
        password,
        port,
        server,
        user,
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

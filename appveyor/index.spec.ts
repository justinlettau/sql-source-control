const snapshot = require('../snapshots/AdventureWorks2017.json');
const cache = require('../_sql-database/cache.json');

describe('appveyor', () => {
  it('cache should match snapshot', () => {
    expect(cache).toEqual(snapshot);
  });
});

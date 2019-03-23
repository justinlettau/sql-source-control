const oldCache = require('./appveyor-cache.json');
// eslint-disable-next-line import/no-unresolved
const newCache = require('../_sql-database/cache.json');

(() => {
  if (!oldCache || !newCache) {
    throw new Error('Cache files not found!');
  }

  const oldCount = Object.keys(oldCache.files).length;
  const newCount = Object.keys(newCache.files).length;

  if (oldCount !== newCount) {
    throw new Error(`Cache file counts do not match! Expected ${oldCount}, but received ${newCount}!`);
  }

  const files = Object.keys(oldCache.files);

  files.forEach(file => {
    if (oldCache.files[file] !== newCache.files[file]) {
      throw new Error(`Checksum comparison failed for ${file}!`);
    }
  });
})();

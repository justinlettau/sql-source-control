const checksum = require('checksum');
const glob = require('glob');
const sums = require('./checksums.json');

const files = glob.sync('./_sql-database/**/*.sql');
let promise = Promise.all([]);

files.forEach(file => {
  promise = promise.then(() => {
    return new Promise(resolve => {
      checksum.file(file, (err, sum) => {
        if (err) {
          throw err;
        }

        if (sums[file] !== sum) {
          throw new Error(`Checksum failed for ${file}!`);
        }

        resolve();
      })
    });
  });
});

promise.then(() => {
  console.log('Checksum test successful!');
});

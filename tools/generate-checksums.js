const checksum = require('checksum');
const glob = require('glob');
const fs = require('fs-extra');

const files = glob.sync('./_sql-database/**/*.sql');
const output = {};
let promise = Promise.all([]);

files.forEach(file => {
  promise = promise.then(() => {
    return new Promise(resolve => {
      checksum.file(file, (err, sum) => {
        if (err) {
          throw err;
        }

        output[file] = sum;
        resolve();
      })
    });
  });
});

promise.then(() => {
  fs.writeJsonSync('./tools/checksums.json', output, { spaces: 2 });
  console.log('Checksum file generated!');
});

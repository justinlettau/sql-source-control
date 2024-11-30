import { readFileSync, statSync } from 'fs-extra';
import { glob } from 'glob';

describe('docker', () => {
  it('file contents should match snapshots', () => {
    const getAllFilenames = (folder: string): string[] => {
      return glob.sync(folder + '**/*');
    };

    const snapshots = getAllFilenames(
      'snapshots/AdventureWorks2017/_sql-database/'
    );
    const results = getAllFilenames('_sql-database/');

    // Just in case the glob results aren't in a predictable order
    snapshots.sort();
    results.sort();

    expect(snapshots.length).toEqual(results.length);

    snapshots.map((snapshot, index) => {
      const result = results[index];

      expect(snapshot).toContain(result);

      const stat = statSync(result);
      if (stat.isFile()) {
        const resultContent = readFileSync(result).toString();
        const snapshotContent = readFileSync(snapshot).toString();

        expect(resultContent).toEqual(snapshotContent);
      }
    });
  });
});

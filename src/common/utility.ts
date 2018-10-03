import * as filenamify from 'filenamify';
import * as glob from 'glob';

import Config from '../common/config';

/**
 * Helper methods.
 */
export default class Utility {

  /**
   * Remove unsafe characters from file name.
   *
   * @param file Path and file name.
   */
  public static safeFile(file: string): string {
    return filenamify(file);
  }

  /**
   * Get all SQL files in correct execution order.
   *
   * @param config Config object used to search for connection.
   */
  public static getFilesOrdered(config: Config): string[] {
    const output: string[] = [];
    const directories: string[] = [
      config.output.schemas,
      config.output.tables,
      config.output.types,
      config.output.views,
      config.output.functions,
      config.output.procs,
      config.output.triggers,
      config.output.data
    ] as string[];

    directories.forEach(dir => {
      if (dir) {
        const files: string[] = glob.sync(`${config.output.root}/${dir}/**/*.sql`);
        output.push(...files);
      }
    });

    return output;
  }
}

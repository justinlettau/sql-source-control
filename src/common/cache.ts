import * as fs from 'fs-extra';
import * as path from 'path';

import Config from './config';
import { ICache } from './interfaces';

/**
 * File checksum cache.
 */
export default class Cache implements ICache {

  /**
   * Default cache file.
   */
  public static readonly defaultCacheFile: string = 'cache.json';

  constructor(config: Config) {
    this.config = config;
  }

  /**
   * File checksums.
   */
  public files: { [key: string]: string } = {};

  /**
   * Current configuration.
   */
  private config: Config;

  /**
   * Load configuration options from file.
   */
  public load(): void {
    if (!this.doesDefaultExist()) {
      return;
    }

    try {
      const file: string = path.join(this.config.output.root, Cache.defaultCacheFile);
      const cache: ICache = fs.readJsonSync(file);

      this.files = cache.files;
    } catch (error) {
      console.error(`Could not parse cache file. Try deleting the existing ${Cache.defaultCacheFile} file!`);
      process.exit();
    }
  }

  /**
   * Check if a `newSum` is different from the existing file's checksum.
   *
   * @param file File to check.
   * @param newSum New checksum value.
   */
  public didChange(file: string, newSum: string): boolean {
    if (!this.files) {
      return true;
    }

    const oldSum: string = this.files[file];

    if (!oldSum) {
      return true;
    }

    return newSum !== oldSum;
  }

  /**
   * Add file checksum to cache.
   *
   * @param file File to check.
   * @param newSum New checksum value.
   */
  public add(file: string, newSum: string): void {
    if (!file || !newSum) {
      return;
    }

    this.files[file] = newSum;
  }

  /**
   * Write a config file with provided configuration.
   */
  public write(): void {
    const file: string = path.join(this.config.output.root, Cache.defaultCacheFile);
    const content: ICache = { files: this.files };

    fs.writeJson(file, content, { spaces: 2 });
  }

  /**
   * Check if default cache file exists.
   */
  private doesDefaultExist(): boolean {
    const file: string = path.join(this.config.output.root, Cache.defaultCacheFile);

    return fs.existsSync(file);
  }
}

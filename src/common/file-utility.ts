import chalk from 'chalk';
import * as checksum from 'checksum';
import * as filenamify from 'filenamify';
import * as fs from 'fs-extra';
import * as glob from 'glob';
import * as multimatch from 'multimatch';
import * as path from 'path';

import Cache from './cache';
import Config from './config';
import { OperationCounts } from './interfaces';

/**
 * File system interaction and tracking.
 */
export default class FileUtility {
  constructor(config: Config) {
    this.config = config;
    this.existingCache = new Cache(config);
    this.newCache = new Cache(config);

    this.load();
  }

  /**
   * Current configuration.
   */
  private config: Config;

  /**
   * Existing files.
   */
  private existingFiles: string[];

  /**
   * Existing cache.
   */
  private existingCache: Cache;

  /**
   * Cache generated during file writing.
   */
  private newCache: Cache;

  /**
   * Counts about files written / removed.
   */
  private stats: OperationCounts = {
    added: 0,
    updated: 0,
    removed: 0
  };

  /**
   * Write file to the file system.
   *
   * @param file Directory to write, relative to root.
   * @param file File name to write to.
   * @param content File content to write.
   */
  public write(dir: string | false, file: string, content: string): void {
    if (dir === false) {
      return;
    }

    // remove unsafe characters
    file = filenamify(file);

    if (!this.shouldWrite(file)) {
      return;
    }

    file = path.join(this.config.output.root, dir, file);
    content = content.trim();

    const cacheKey: string = this.normalize(file);
    const cacheValue: string = checksum(content);
    this.newCache.add(cacheKey, cacheValue);

    if (!this.doesExist(file)) {
      this.stats.added++;
    } else if (this.existingCache.didChange(cacheKey, cacheValue)) {
      this.stats.updated++;
    }

    fs.outputFileSync(file, content);
    this.markAsWritten(file);
  }

  /**
   * Delete all paths remaining in `existing`.
   */
  public finalize(): string {
    this.existingFiles.forEach(file => {
      this.stats.removed++;
      fs.removeSync(file);
    });

    this.newCache.write();

    const added: string = chalk.green(this.stats.added.toString());
    const updated: string = chalk.cyan(this.stats.updated.toString());
    const removed: string = chalk.red(this.stats.removed.toString());

    return `Successfully added ${added}, updated ${updated}, and removed ${removed} files.`;
  }

  /**
   * Check if a file passes the glob pattern.
   *
   * @param file File path to check.
   */
  private shouldWrite(file: string): boolean {
    if (!this.config.files || !this.config.files.length) {
      return true;
    }

    const results: string[] = multimatch([file], this.config.files);
    return !!results.length;
  }

  /**
   * Check if a file existed.
   *
   * @param file File path to check.
   */
  private doesExist(file: string): boolean {
    if (!this.existingFiles || !this.existingFiles.length) {
      return false;
    }

    file = this.normalize(file);

    const index: number = this.existingFiles.indexOf(file);
    return index !== -1;
  }

  /**
   * Remove `file` from `existing`, if it exists.
   *
   * @param file File path to check.
   */
  private markAsWritten(file: string): void {
    if (!file) {
      return;
    }

    file = this.normalize(file);

    const index: number = this.existingFiles.indexOf(file);

    if (index !== -1) {
      this.existingFiles.splice(index, 1);
    }
  }

  /**
   * Normalize file path for comparison.
   *
   * @param file File path to normalize.
   */
  private normalize(file: string): string {
    if (this.config.output.root.startsWith('./') && !file.startsWith('./')) {
      file = `./${file}`;
    }

    return file.replace(/\\/g, '/');
  }

  /**
   * Load existing files and cache for comparison.
   */
  private load(): void {
    this.existingFiles = glob.sync(`${this.config.output.root}/**/*.sql`);
    this.existingCache.load();
  }
}

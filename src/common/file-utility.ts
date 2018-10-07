import chalk from 'chalk';
import * as filenamify from 'filenamify';
import * as fs from 'fs-extra';
import * as glob from 'glob';
import * as multimatch from 'multimatch';
import * as path from 'path';

import Config from './config';

/**
 * File system interaction and tracking.
 */
export default class FileUtility {
  constructor(config: Config) {
    this.config = config;
    this.loadExisting();
  }

  /**
   * Current configuration.
   */
  private config: Config;

  /**
   * Existing files.
   */
  private existing: string[];

  /**
   * Statistics about files written / removed.
   */
  private stats: { added: number; updated: number; removed: number; } = {
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

    if (this.doesExist(file)) {
      this.stats.updated++;
    } else {
      this.stats.added++;
    }

    fs.outputFileSync(file, content.trim());
    this.markAsWritten(file);
  }

  /**
   * Delete all paths remaining in `existing`.
   */
  public finalize(): string {
    this.existing.forEach(file => {
      this.stats.removed++;
      fs.removeSync(file);
    });

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
    if (!this.existing || !this.existing.length) {
      return false;
    }

    file = this.normalize(file);

    const index: number = this.existing.indexOf(file);
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

    const index: number = this.existing.indexOf(file);

    if (index !== -1) {
      this.existing.splice(index, 1);
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
   * Load existing files array for comparison.
   */
  private loadExisting(): void {
    this.existing = glob.sync(`${this.config.output.root}/**/*.sql`);
  }
}

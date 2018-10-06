import chalk from 'chalk';
import * as filenamify from 'filenamify';
import * as fs from 'fs-extra';
import * as glob from 'glob';
import * as multimatch from 'multimatch';
import * as path from 'path';
import { isArray } from 'ts-util-is';

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

    console.log(`Creating ${chalk.cyan(file)} ...`);
    fs.outputFileSync(file, content.trim());

    this.markAsWritten(file);
  }

  /**
   * Delete all paths remaining in `existing`.
   */
  public removeRemaining(): void {
    this.existing.forEach(file => {
      console.log(`Removing ${chalk.cyan(file)} ...`);
      fs.removeSync(file);
    });
  }

  /**
   * Check if a file passes the glob pattern.
   *
   * @param file File path to check.
   */
  private shouldWrite(file: string | string[]): boolean {
    if (!this.config.files || !this.config.files.length) {
      return true;
    }

    if (!isArray(file)) {
      file = [file];
    }

    const results: string[] = multimatch(file, this.config.files);
    return !!results.length;
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

    if (this.config.output.root.startsWith('./') && !file.startsWith('./')) {
      file = `./${file}`;
    }

    const index: number = this.existing.indexOf(file.replace(/\\/g, '/'));

    if (index !== -1) {
      this.existing.splice(index, 1);
    }
  }

  /**
   * Load existing files array for comparison.
   */
  private loadExisting(): void {
    this.existing = glob.sync(`${this.config.output.root}/**/*.sql`);
  }
}

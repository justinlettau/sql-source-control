import chalk from 'chalk';
import * as fs from 'fs-extra';
import { EOL } from 'os';

import Config from '../common/config';
import Utility from '../common/utility';

export default class Cat {

  /**
   * Invoke action.
   */
  public invoke(): void {
    const start: [number, number] = process.hrtime();
    const config: Config = new Config();
    let output: string = '';

    // order is important
    const files: string[] = Utility.getFilesOrdered(config);

    files.forEach(file => {
      const content: string = fs.readFileSync(file).toString();
      const end: string = content.substr(-2).toLowerCase();

      output += content;
      output += EOL;
      output += (end !== 'go' ? 'go' : '');
      output += EOL + EOL;
    });

    fs.outputFileSync(`${config.output.root}/cat.sql`, output);

    const time: [number, number] = process.hrtime(start);
    console.log(chalk.green(`Finished after ${time[0]}s!`));
  }
}

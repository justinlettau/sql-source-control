import * as chalk from 'chalk';
import * as fs from 'fs-extra';
import * as glob from 'glob';
import { EOL } from 'os';

import { Config } from '../common/config';
import * as util from '../common/utility';

/**
 * Concatenate all SQL files into a single file.
 */
export function cat(): void {
    const start: [number, number] = process.hrtime();
    const config: Config = util.getConfig();
    let output: string = '';

    // order is important
    const directories: string[] = [
        config.output.tables,
        config.output.views,
        config.output['scalar-valued'],
        config.output['table-valued'],
        config.output.views,
        config.output.procs,
        config.output.triggers
    ];

    for (let dir of directories) {
        const files: string[] = glob.sync(`${config.output.root}/${dir}/**/*.sql`);

        for (let file of files) {
            const content: string = fs.readFileSync(file).toString();
            const end: string = content.substr(-2).toLowerCase();

            output += content;
            output += EOL;
            output += (end !== 'go' ? 'go' : '');
            output += EOL + EOL;
        }
    }

    fs.outputFileSync(`${config.output.root}/cat.sql`, output);

    const time: [number, number] = process.hrtime(start);
    console.log(chalk.green(`Finished after ${time[0]}s!`));
}

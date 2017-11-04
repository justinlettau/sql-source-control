import * as chalk from 'chalk';
import { Connection } from '../common/connection';
import * as util from '../common/utility';
import { Config } from '../common/config';
import { exec } from 'child_process';
import { isUndefined } from 'ts-util-is';
import Global = NodeJS.Global;

/**
 * set context of connection.
 *
 * @param name Connection name to use.
 */
export function use(name: string): void {
    // setEnvirenmentValue('nodeSscContext' , name);
    const ccrt: string = 'nodeSscCurrentcontext'
    process.env[ccrt] = name;
    console.log(`context has not changed to ${chalk.magenta(process.env[ccrt])}, this funciton not finished!`);
}

/**
 * show context of connection.
 * @param name Optional context name to query
 */
export function show(name?: string): void {
    const config: Config  = util.getConfig();
    if ( isUndefined(name)) {
        for (const cnct in config.connections) {
            if (cnct) {
                showDetails( config.connections[cnct]);
            }
        }
    } else if (name !== '' ) {
        let conn: Connection ;
        if (name) {
            conn = config.connections.find(item => item.name.toLocaleLowerCase() === name.toLowerCase());
        } else {
            // default to first
            conn = config.connections[0];
        }
        if (!!conn) {
            showDetails(conn);
        } else {
            console.log(chalk.red('链接' + name + '不存在'));
        }
    } else {
        console.log(chalk.red('no context was set, you need to set context with "use" command'));
        return;
    }

}

function showDetails(conn: Connection): void {
    const ccrt: string = 'nodeSscCurrentcontext'
    console.log(`${process.env[ccrt]} is current ;
${conn.name} :
name is [${conn.name}];
server is [${conn.server}];
port is [${conn.port}];
database is [${conn.database}];
user is [${conn.user}];
password is [${conn.password}];
    `);
}

/**
 * set Envirenment
 * @param {string} name
 * @param {string} value
 */
function setEnvirenmentValue(name: string, value: string): void {
    exec(`export ${name}=` + value , ( err , stdout , stderr ) => {
        if ( err ) {
            console.log(chalk.red('node: environment set error:' + stderr ));
        } else {
            console.log(`set envirentment success ! export ${name}=\` + ${value} `);
        }
    });

}

/**
 * get Envirentment value by name
 * @param {string} name
 * @returns {string}
 */
function getEnvirentmentValue(name: string ): string {
    let valuestr: string = '' ;
    exec(`echo $${name}` , ( err , stdout , stderr ) => {
        if ( err ) {
            console.log(chalk.red('error:' + stderr ));
        } else {
            valuestr = stdout.replace('\n', '') ;
            console.log(`get envirentment success ! ${name}=\` + ${valuestr} `);
        }
    });
    return valuestr ;
}

import { Connection } from './connection';
import { IdempotencyConfig } from './idempotency';
import { OutputConfig } from './output';

/**
 * Supported configuration for `ssc.json` file.
 */
export interface Config {

    /**
     * Path to `Web.config` file or connection object.
     */
    connection: string | Connection;

    /**
     * Glob of files to include / exclude.
     */
    files?: string[];

    /**
     * Describes output folder structure.
     */
    output?: OutputConfig;

    /**
     * Describes idempotent script to be used.
     */
    idempotency?: IdempotencyConfig;
}

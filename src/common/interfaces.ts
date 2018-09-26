import Connection from './connection';
import { IdempotencyOption } from './types';

/**
 * Configuration object properties.
 */
export interface ConfigObj {
  connections: string | Connection[];
  files: string[];
  data: string[];
  output: OutputConfig;
  idempotency: IdempotencyConfig;
}

/**
 * Connection object properties.
 */
export interface ConnectionObj {
  name: string;
  server: string;
  database: string;
  port: number;
  user: string;
  password: string;
}

/**
 * Supported idempotency configuration.
 */
export interface IdempotencyConfig {
  'procs'?: IdempotencyOption;
  'scalar-valued'?: IdempotencyOption;
  'table-valued'?: IdempotencyOption;
  'table-valued-parameters'?: IdempotencyOption;
  'tables'?: IdempotencyOption;
  'triggers'?: IdempotencyOption;
  'views'?: IdempotencyOption;
}

/**
 * Supported output configuration.
 */
export interface OutputConfig {
  'root'?: string;
  'data'?: string | false;
  'procs'?: string | false;
  'scalar-valued'?: string | false;
  'schemas'?: string | false;
  'table-valued'?: string | false;
  'table-valued-parameters'?: string | false;
  'tables'?: string | false;
  'triggers'?: string | false;
  'views'?: string | false;
}

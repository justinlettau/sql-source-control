import { IdempotencyData, IdempotencyObject } from './types';

/**
 * Cache object properties.
 */
// tslint:disable-next-line:interface-name
export interface ICache {
  files: { [key: string]: string; };
}

/**
 * File utility operation counts.
 */
export interface OperationCounts {
  added: number;
  updated: number;
  removed: number;
}

/**
 * Configuration object properties.
 */
// tslint:disable-next-line:interface-name
export interface IConfig {
  connections: string | IConnection[];
  files?: string[];
  data?: string[];
  output?: OutputConfig;
  idempotency?: IdempotencyConfig;
}

/**
 * Connection object properties.
 */
// tslint:disable-next-line:interface-name
export interface IConnection {
  name: string;
  server: string;
  database: string;
  port?: number;
  user: string;
  password: string;
}

/**
 * Supported idempotency configuration.
 */
export interface IdempotencyConfig {
  data?: IdempotencyData;
  functions?: IdempotencyObject;
  procs?: IdempotencyObject;
  tables?: IdempotencyObject;
  triggers?: IdempotencyObject;
  types?: IdempotencyObject;
  views?: IdempotencyObject;
}

/**
 * Supported output configuration.
 */
export interface OutputConfig {
  root?: string;
  data?: string | false;
  functions?: string | false;
  procs?: string | false;
  schemas?: string | false;
  tables?: string | false;
  triggers?: string | false;
  types?: string | false;
  views?: string | false;
}

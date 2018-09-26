import { IdempotencyOption } from './types';

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

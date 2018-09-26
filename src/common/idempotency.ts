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
 * Supported idempotency types.
 */
export type IdempotencyOption = 'if-exists-drop' | 'if-not-exists' | false;

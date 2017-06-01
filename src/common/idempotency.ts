/**
 * Supported idempotency configuration.
 */
export interface IdempotencyConfig {
    'scalar-valued'?: IdempotencyOption;
    'table-valued'?: IdempotencyOption;
    'procs'?: IdempotencyOption;
    'tables'?: IdempotencyOption;
    'triggers'?: IdempotencyOption;
    'views'?: IdempotencyOption;
}

/**
 * Supported idempotency types.
 */
export type IdempotencyOption = 'if-exists-drop' | 'if-not-exists';

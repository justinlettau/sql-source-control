/**
 * Idempotency options for objects.
 */
export type IdempotencyObject = 'if-exists-drop' | 'if-not-exists' | false;

/**
 * Idempotency options for data files.
 */
export type IdempotencyData =
  | 'delete-and-reseed'
  | 'delete'
  | 'truncate'
  | false;

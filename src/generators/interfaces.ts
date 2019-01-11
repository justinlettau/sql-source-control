import { SqlPrimaryKey } from '../queries/interfaces';

/**
 * Primary key's grouped by name.
 */
export interface GroupedIndexes {
  [key: string]: SqlPrimaryKey[];
}

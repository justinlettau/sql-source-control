/**
 * Common helper functions.
 */
export class Helpers {
  /**
   * Group a collection of objects by a specific key.
   *
   * @param items Collection of items to group.
   * @param key Property name to group by.
   */
  static groupByName<T extends { [key: string]: any }>(
    items: T[],
    key: string
  ): { [key: string]: T[] } {
    return items.reduce((prev, cur) => {
      const prop = cur[key];
      const group = (prev[prop] = prev[prop] || []);
      group.push(cur);

      return prev;
    }, {} as { [key: string]: T[] });
  }
}

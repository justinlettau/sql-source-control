/* tslint:disable:max-line-length */
import { EOL } from 'os';
import { isBoolean, isDate, isNull, isString } from 'ts-util-is';

import Config from '../common/config';
import {
  SqlColumn,
  SqlDataResult,
  SqlForeignKey,
  SqlIndex,
  SqlObject,
  SqlPrimaryKey,
  SqlSchema,
  SqlTable,
  SqlType
} from '../queries/interfaces';

/**
 * MSSQL generator.
 */
export default class MSSQLGenerator {
  constructor(config: Config) {
    this.config = config;
  }

  /**
   * Current configuration.
   */
  private config: Config;

  /**
   * Get data file content.
   *
   * @param item Row from query.
   */
  public data(item: SqlDataResult): string {
    let output: string = '';

    switch (this.config.idempotency.data) {
      case 'delete':
        output += `DELETE FROM ${item.name}` + EOL;
        output += EOL;
        break;
      case 'delete-and-reseed':
        output += `DELETE FROM ${item.name}`;
        output += EOL;
        output += `DBCC CHECKIDENT ('${item.name}', RESEED, 0)`;
        output += EOL;
        break;
      case 'truncate':
        output += `TRUNCATE TABLE ${item.name}`;
        output += EOL;
        break;
    }

    output += EOL;
    output += `SET IDENTITY_INSERT ${item.name} ON`;
    output += EOL;
    output += EOL;

    item.result.recordset.forEach(row => {
      const keys: string[] = Object.keys(row);
      const columns: string = keys.join(', ');
      const values: string = keys.map(key => this.safeValue(row[key])).join(', ');

      output += `INSERT INTO ${item.name} (${columns}) VALUES (${values})`;
      output += EOL;
    });

    output += EOL;
    output += `SET IDENTITY_INSERT ${item.name} OFF`;

    return output;
  }

  /**
   * Get function file content.
   *
   * @param item Row from query.
   */
  public function(item: SqlObject): string {
    const objectId: string = `[${item.schema}].[${item.name}]`;
    const type: string = item.type.trim();
    let output: string = '';

    switch (this.config.idempotency.functions) {
      case 'if-exists-drop':
        output += `IF EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('${objectId}') AND type = '${type}')`;
        output += EOL;
        output += `DROP FUNCTION ${objectId}`;
        output += EOL;
        output += 'GO';
        output += EOL;
        break;
      case 'if-not-exists':
        output += `IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('${objectId}') AND type = '${type}')`;
        output += EOL;
        break;
    }

    output += item.text;

    return output;
  }

  /**
   * Get stored procedure file content.
   *
   * @param item Row from query.
   */
  public storedProcedure(item: SqlObject): string {
    const objectId: string = `[${item.schema}].[${item.name}]`;
    const type: string = item.type.trim();
    let output: string = '';

    switch (this.config.idempotency.procs) {
      case 'if-exists-drop':
        output += `IF EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('${objectId}') AND type = '${type}')`;
        output += EOL;
        output += `DROP PROCEDURE ${objectId}`;
        output += EOL;
        output += 'GO';
        output += EOL;
        break;
      case 'if-not-exists':
        output += `IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('${objectId}') AND type = '${type}')`;
        output += EOL;
        break;
    }

    output += item.text;

    return output;
  }

  /**
   * Get schema file content.
   *
   * @param item Row from query.
   */
  public schema(item: SqlSchema): string {
    let output: string = '';

    output += `IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = '${item.name}')`;
    output += EOL;
    output += `EXEC('CREATE SCHEMA ${item.name}')`;

    return output;
  }

  /**
   * Get table file content.
   *
   * @param item Row from query.
   * @param columns Columns from query.
   * @param primaryKeys Primary key from query.
   * @param foreignKeys Foreign keys from query.
   * @param indexes Indexes from query.
   */
  public table(
    item: SqlTable,
    columns: SqlColumn[],
    primaryKeys: SqlPrimaryKey[],
    foreignKeys: SqlForeignKey[],
    indexes: SqlIndex[]
  ): string {
    const objectId: string = `[${item.schema}].[${item.name}]`;
    const type: string = item.type.trim();
    let output: string = '';

    switch (this.config.idempotency.tables) {
      case 'if-exists-drop':
        output += `IF EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('${objectId}') AND type = '${type}')`;
        output += EOL;
        output += `DROP TABLE ${objectId}`;
        output += EOL;
        output += 'GO';
        output += EOL;
        break;
      case 'if-not-exists':
        output += `IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('${objectId}') AND type = '${type}')`;
        output += EOL;
        break;
    }

    output += `CREATE TABLE ${objectId}`;
    output += EOL;
    output += '(';
    output += EOL;

    columns
      .filter(x => x.object_id === item.object_id)
      .forEach(col => {
        output += '    ' + this.column(col) + ',';
        output += EOL;
      });

    primaryKeys
      .filter(x => x.object_id === item.object_id)
      .forEach(pk => {
        output += '    ' + this.primaryKey(pk);
        output += EOL;
      });

    output += ')';

    foreignKeys = foreignKeys.filter(x => x.object_id === item.object_id);
    indexes = indexes.filter(x => x.object_id === item.object_id);

    if (foreignKeys.length || indexes.length) {
      output += EOL;
      output += EOL;
    }

    foreignKeys.forEach(fk => {
      output += this.foreignKey(fk);
      output += EOL;
    });

    if (foreignKeys.length && indexes.length) {
      output += EOL;
    }

    indexes.forEach(index => {
      output += this.index(index);
      output += EOL;
    });

    return output;
  }

  /**
   * Get trigger file content.
   *
   * @param item Row from query.
   */
  public trigger(item: SqlObject): string {
    const objectId: string = `[${item.schema}].[${item.name}]`;
    const type: string = item.type.trim();
    let output: string = '';

    switch (this.config.idempotency.triggers) {
      case 'if-exists-drop':
        output += `IF EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('${objectId}') AND type = '${type}')`;
        output += EOL;
        output += `DROP TRIGGER ${objectId}`;
        output += EOL;
        output += 'GO';
        output += EOL;
        break;
      case 'if-not-exists':
        output += `IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('${objectId}') AND type = '${type}')`;
        output += EOL;
        break;
    }

    output += item.text;

    return output;
  }

  /**
   * Get type file content.
   *
   * @param item Row from query.
   * @param columns Columns from query.
   */
  public type(item: SqlType, columns: SqlColumn[]): string {
    const objectId: string = `[${item.schema}].[${item.name}]`;
    const type: string = item.type.trim();
    let output: string = '';

    switch (this.config.idempotency.types) {
      case 'if-exists-drop':
        output += 'IF EXISTS (';
        output += EOL;
        output += '    SELECT 1 FROM sys.table_types AS t';
        output += EOL;
        output += '    JOIN sys.schemas s ON t.schema_id = s.schema_id';
        output += EOL;
        output += `    WHERE t.name = '${item.name}' AND s.name = '${item.schema}'`;
        output += EOL;
        output += ')';
        output += EOL;
        output += `DROP TYPE ${objectId}`;
        output += EOL;
        output += 'GO';
        output += EOL;
        break;
      case 'if-not-exists':
        output += `IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('${objectId}') AND type = '${type}')`;
        output += EOL;
        break;
    }

    output += `CREATE TYPE ${objectId} AS TABLE`;
    output += EOL;
    output += '(';
    output += EOL;

    columns
      .filter(x => x.object_id === item.object_id)
      .forEach((col, idx, array) => {
        output += '    ' + this.column(col);

        if (idx !== array.length - 1) {
          // not the last column
          output += ',';
        }

        output += EOL;
      });

    output += ')';

    return output;
  }

  /**
   * Get view file content.
   *
   * @param item Row from query.
   */
  public view(item: SqlObject): string {
    const objectId: string = `[${item.schema}].[${item.name}]`;
    const type: string = item.type.trim();
    let output: string = '';

    switch (this.config.idempotency.views) {
      case 'if-exists-drop':
        output += `IF EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('${objectId}') AND type = '${type}')`;
        output += EOL;
        output += `DROP VIEW ${objectId}`;
        output += EOL;
        output += 'GO';
        output += EOL;
        break;
      case 'if-not-exists':
        output += `IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('${objectId}') AND type = '${type}')`;
        output += EOL;
        break;
    }

    output += item.text;

    return output;
  }

  /**
   * Safely transform SQL value for scripting.
   *
   * @param value SQL data value.
   */
  private safeValue(value: any): any {
    if (isNull(value)) {
      return 'NULL';
    }
    
    if (isString(value)) {
      value = value.replace("'", "''");
      return `'${value}'`;
    }

    if (isDate(value)) {
      value = value.toISOString();
      return `'${value}'`;
    }

    if (isBoolean(value)) {
      return value ? 1 : 0;
    }

    return value;
  }

  /**
   * Get script for table's column.
   *
   * @param item Row from query.
   */
  private column(item: SqlColumn): string {
    let output: string = `[${item.name}]`;
    let size: string | number;

    if (item.is_computed) {
      output += ` AS ${item.formula}`;
      return output;
    }

    output += ` ${item.datatype}`;

    switch (item.datatype) {
      case 'varchar':
      case 'char':
      case 'varbinary':
      case 'binary':
      case 'text':
        size = (item.max_length === -1 ? 'max' : item.max_length);
        output += `(${size})`;
        break;
      case 'nvarchar':
      case 'nchar':
      case 'ntext':
        size = (item.max_length === -1 ? 'max' : item.max_length / 2);
        output += `(${size})`;
        break;
      case 'datetime2':
      case 'time2':
      case 'datetimeoffset':
        output += `(${item.scale})`;
        break;
      case 'decimal':
        output += `(${item.precision}, ${item.scale})`;
        break;
    }

    if (item.collation_name) {
      output += ` COLLATE ${item.collation_name}`;
    }

    output += item.is_nullable ? ' NULL' : ' NOT NULL';

    if (item.definition) {
      output += ` DEFAULT${item.definition}`;
    }

    if (item.is_identity) {
      output += ` IDENTITY(${item.seed_value || 0}, ${item.increment_value || 1})`;
    }

    return output;
  }

  /**
   * Get script for table's primary key.
   *
   * @param item Row from query.
   */
  private primaryKey(item: SqlPrimaryKey): string {
    const direction: string = item.is_descending_key ? 'DESC' : 'ASC';

    return `CONSTRAINT [${item.name}] PRIMARY KEY ([${item.column}] ${direction})`;
  }

  /**
   * Get script for table's foreign key.
   *
   * @param item Row from foreignKeys query.
   */
  private foreignKey(item: SqlForeignKey): string {
    const objectId: string = `[${item.schema}].[${item.table}]`;
    const parentObjectId: string = `[${item.parent_schema}].[${item.parent_table}]`;
    let output: string = '';

    output += `ALTER TABLE ${objectId} WITH ${item.is_not_trusted ? 'NOCHECK' : 'CHECK'}`;
    output += ` ADD CONSTRAINT [${item.name}] FOREIGN KEY ([${item.column}])`;
    output += ` REFERENCES ${parentObjectId} ([${item.reference}])`;

    switch (item.delete_referential_action) {
      case 1:
        output += ' ON DELETE CASCADE';
        break;
      case 2:
        output += ' ON DELETE SET NULL';
        break;
      case 3:
        output += ' ON DELETE SET DEFAULT';
        break;
    }

    switch (item.update_referential_action) {
      case 1:
        output += ' ON UPDATE CASCADE';
        break;
      case 2:
        output += ' ON UPDATE SET NULL';
        break;
      case 3:
        output += ' ON UPDATE SET DEFAULT';
        break;
    }

    output += EOL;
    output += `ALTER TABLE ${objectId} CHECK CONSTRAINT [${item.name}]`;

    return output;
  }

  /**
   * Get script for table's indexes.
   *
   * @param item Row from query.
   */
  private index(item: SqlIndex): string {
    const objectId: string = `[${item.schema}].[${item.table}]`;
    let output: string = '';

    output += `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('${objectId}') AND name = '${item.name}')`;
    output += EOL;
    output += 'CREATE';

    if (item.is_unique) {
      output += ' UNIQUE';
    }

    output += ` NONCLUSTERED INDEX [${item.name}] ON ${objectId}`;
    output += `([${item.column}] ${item.is_descending_key ? 'DESC' : 'ASC'})`;

    // todo (jbl): includes

    output += EOL;

    return output;
  }
}

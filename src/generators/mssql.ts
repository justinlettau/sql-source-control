/* tslint:disable:max-line-length */
import { EOL } from 'os';
import { isBoolean, isDate, isString } from 'ts-util-is';

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
        output += `delete from ${item.name}` + EOL;
        output += EOL;
        break;
      case 'delete-and-reseed':
        output += `delete from ${item.name}`;
        output += EOL;
        output += `dbcc checkident ('${item.name}', reseed, 0)`;
        output += EOL;
        break;
      case 'truncate':
        output += `truncate table ${item.name}`;
        output += EOL;
        break;
    }

    output += EOL;
    output += `set identity_insert ${item.name} on`;
    output += EOL;
    output += EOL;

    item.result.recordset.forEach(row => {
      const keys: string[] = Object.keys(row);
      const columns: string = keys.join(', ');
      const values: string = keys.map(key => this.safeValue(row[key])).join(', ');

      output += `insert into ${item.name} (${columns}) values (${values})`;
      output += EOL;
    });

    output += EOL;
    output += `set identity_insert ${item.name} off`;
    output += EOL;
    output += EOL;

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
        output += `if exists (select * from sys.objects where object_id = object_id('${objectId}') and type = '${type}')`;
        output += EOL;
        output += `drop function ${objectId}`;
        output += EOL;
        output += 'go';
        output += EOL;
        break;
      case 'if-not-exists':
        output += `if not exists (select * from sys.objects where object_id = object_id('${objectId}') and type = '${type}')`;
        output += EOL;
        break;
    }

    output += EOL;
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
        output += `if exists (select * from sys.objects where object_id = object_id('${objectId}') and type = '${type}')`;
        output += EOL;
        output += `drop procedure ${objectId}`;
        output += EOL;
        output += 'go';
        output += EOL;
        break;
      case 'if-not-exists':
        output += `if not exists (select * from sys.objects where object_id = object_id('${objectId}') and type = '${type}')`;
        output += EOL;
        break;
    }

    output += EOL;
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

    output += `if not exists (select * from sys.schemas where name = '${item.name}')`;
    output += EOL;
    output += `exec('create schema ${item.name}')`;

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
        output += `if exists (select * from sys.objects where object_id = object_id('${objectId}') and type = '${type}')`;
        output += EOL;
        output += `drop table ${objectId}`;
        output += EOL;
        output += 'go';
        output += EOL;
        break;
      case 'if-not-exists':
        output += `if not exists (select * from sys.objects where object_id = object_id('${objectId}') and type = '${type}')`;
        output += EOL;
        break;
    }

    output += `create table ${objectId}`;
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
    output += EOL;
    output += EOL;

    foreignKeys
      .filter(x => x.object_id === item.object_id)
      .forEach(fk => {
        output += this.foreignKey(fk);
        output += EOL;
      });

    output += EOL;
    output += EOL;

    indexes
      .filter(x => x.object_id === item.object_id)
      .forEach(index => {
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
        output += `if exists (select * from sys.objects where object_id = object_id('${objectId}') and type = '${type}')`;
        output += EOL;
        output += `drop trigger ${objectId}`;
        output += EOL;
        output += 'go';
        output += EOL;
        break;
      case 'if-not-exists':
        output += `if not exists (select * from sys.objects where object_id = object_id('${objectId}') and type = '${type}')`;
        output += EOL;
        break;
    }

    output += EOL;
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
        output += 'if exists (';
        output += EOL;
        output += '    select * from sys.table_types as t';
        output += EOL;
        output += '    join sys.schemas s on t.schema_id = s.schema_id';
        output += EOL;
        output += `    where t.name = '${item.name}' and s.name = '${item.schema}'`;
        output += EOL;
        output += ')';
        output += EOL;
        output += `drop type ${objectId}`;
        output += EOL;
        output += 'go';
        output += EOL;
        break;
      case 'if-not-exists':
        output += `if exists (select * from sys.objects where object_id = object_id('${objectId}') and type = '${type}')`;
        output += EOL;
        output += `drop type ${objectId}`;
        output += EOL;
        output += 'go';
        output += EOL;
        break;
    }

    output += `create type ${objectId} as table`;
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
    output += EOL;
    output += EOL;

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
        output += `if exists (select * from sys.objects where object_id = object_id('${objectId}') and type = '${type}')`;
        output += EOL;
        output += `drop view ${objectId}`;
        output += EOL;
        output += 'go';
        output += EOL;
        break;
      case 'if-not-exists':
        output += `if not exists (select * from sys.objects where object_id = object_id('${objectId}') and type = '${type}')`;
        output += EOL;
        break;
    }

    output += EOL;
    output += item.text;

    return output;
  }

  /**
   * Safely transform SQL value for scripting.
   *
   * @param value SQL data value.
   */
  private safeValue(value: any): any {
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
      output += ` as ${item.formula}`;
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
      output += ` collate ${item.collation_name}`;
    }

    output += item.is_nullable ? ' null' : ' not null';

    if (item.definition) {
      output += ` default${item.definition}`;
    }

    if (item.is_identity) {
      output += ` identity(${item.seed_value || 0}, ${item.increment_value || 1})`;
    }

    return output;
  }

  /**
   * Get script for table's primary key.
   *
   * @param item Row from query.
   */
  private primaryKey(item: SqlPrimaryKey): string {
    const direction: string = item.is_descending_key ? 'desc' : 'asc';

    return `constraint [${item.name}] primary key ([${item.column}] ${direction})`;
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

    output += `alter table ${objectId} with ${item.is_not_trusted ? 'nocheck' : 'check'}`;
    output += ` add constraint [${item.name}] foreign key([${item.column}])`;
    output += ` references ${parentObjectId} ([${item.reference}])`;

    switch (item.delete_referential_action) {
      case 1:
        output += ' on delete cascade';
        break;
      case 2:
        output += ' on delete set null';
        break;
      case 3:
        output += ' on delete set default';
        break;
    }

    switch (item.update_referential_action) {
      case 1:
        output += ' on update cascade';
        break;
      case 2:
        output += ' on update set null';
        break;
      case 3:
        output += ' on update set default';
        break;
    }

    output += ` alter table ${objectId} check constraint [${item.name}]`;

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

    output += `if not exists (select * from sys.indexes where object_id = object_id('${objectId}') and name = '${item.name}')`;
    output += EOL;
    output += 'create';

    if (item.is_unique) {
      output += ' unique';
    }

    output += ` nonclustered index [${item.name}] on ${objectId}`;
    output += `([${item.column}] ${item.is_descending_key ? 'desc' : 'asc'})`;

    // todo (jbl): includes

    output += EOL;

    return output;
  }
}

import { EOL } from 'os';
import { isBoolean, isDate, isString } from 'ts-util-is';

import { IdempotencyOption } from '../common/types';
import {
  AbstractSqlObject,
  SqlColumn,
  SqlDataResult,
  SqlForeignKey,
  SqlIndex,
  SqlPrimaryKey,
  SqlSchema,
  SqlTable
} from './interfaces';

/**
 * Get idempotency script prefix.
 *
 * @param item Row from query.
 * @param type Idempotency prefix type.
 */
export function idempotency(item: AbstractSqlObject, type: IdempotencyOption): string {
  let obj: string;
  const objectId: string = `${item.schema}].[${item.name}`;

  item.type = item.type.trim();

  // get proper object type for `drop` statement
  switch (item.type) {
    case 'U':
      obj = 'table';
      break;
    case 'TT':
      obj = 'table';
      break;
    case 'P':
      obj = 'procedure';
      break;
    case 'V':
      obj = 'view';
      break;
    case 'TF':
    case 'IF':
    case 'FN':
      obj = 'function';
      break;
    case 'TR':
      obj = 'trigger';
      break;
  }

  if (type === 'if-exists-drop') {
    // if exists drop
    if (item.type === 'TT') {
      return [
        'if exists (',
        '    select * from sys.table_types as t',
        '    join sys.schemas s on t.schema_id = s.schema_id',
        `    where t.name = '${item.name}' and s.name = '${item.schema}'`,
        ')',
        `drop type [${objectId}]`,
        'go',
        EOL
      ].join(EOL);
    } else {
      return [
        `if exists (select * from sys.objects where object_id = object_id('[${objectId}]') and type = '${item.type}')`,
        `drop ${obj} [${objectId}]`,
        'go',
        EOL
      ].join(EOL);
    }
  } else if (type === 'if-not-exists') {
    // if not exists
    if (item.type === 'TT') {
      return [
        'if not exists (',
        '    select * from sys.table_types as t',
        '    join sys.schemas s on t.schema_id = s.schema_id',
        `    where t.name = '${item.name}' and s.name = '${item.schema}'`,
        ')',
        ''
      ].join(EOL);
    } else {
      return [
        // tslint:disable-next-line:max-line-length
        `if not exists (select * from sys.objects where object_id = object_id('[${objectId}]') and type = '${item.type}')`,
        ''
      ].join(EOL);
    }
  }

  // none
  return '';
}

/**
 * Get script for schema creation.
 *
 * @param item Object containing schema info.
 */
export function schema(item: SqlSchema): string {
  let output: string = '';

  // idempotency
  output += `if not exists (select * from sys.schemas where name = '${item.name}')`;
  output += EOL;

  output += `exec('create schema ${item.name}')`;
  return output;
}

/**
 * Get script for table's column.
 *
 * @param item Row from `sys.columns` query.
 * @param columns Array of records from `sys.columns` query.
 * @param primaryKeys Array of records from `sys.primaryKeys` query.
 * @param foreignKeys Array of records from `sys.foreignKeys` query.
 * @param indexes Array of records from `sys.indexes` query.
 */
export function table(
  item: SqlTable,
  columns: SqlColumn[],
  primaryKeys: SqlPrimaryKey[],
  foreignKeys: SqlForeignKey[],
  indexes: SqlIndex[]
): string {
  let output: string = `create table [${item.schema}].[${item.name}]`;
  output += EOL;
  output += '(';
  output += EOL;

  // columns
  columns
    .filter(x => x.object_id === item.object_id)
    .forEach(col => {
      output += '    ' + column(col) + ',';
      output += EOL;
    });

  // primary keys
  primaryKeys
    .filter(x => x.object_id === item.object_id)
    .forEach(pk => {
      output += '    ' + primaryKey(pk);
      output += EOL;
    });

  output += ')';

  output += EOL;
  output += EOL;

  // foreign keys
  foreignKeys
  .filter(x => x.object_id === item.object_id)
  .forEach(fk => {
    output += foreignKey(fk);
    output += EOL;
  });

  output += EOL;
  output += EOL;

  // indexes
  indexes
    .filter(x => x.object_id === item.object_id)
    .forEach(ix => {
      output += index(ix);
      output += EOL;
    });

  return output;
}

/**
 * Get script for user-defined table-valued parameter's column.
 *
 * @param item Row from `sys.columns` query.
 * @param columns Array of records from `sys.columns` query.
 */
export function tvp(
  item: SqlTable,
  columns: SqlColumn[]
): string {
  let output: string = `create type [${item.schema}].[${item.name}] as table`;
  output += EOL;
  output += '(';
  output += EOL;

  // columns
  columns
    .filter(x => x.object_id === item.object_id)
    .forEach((col, idx, array) => {
      output += '    ' + column(col);

      // if it is not the last column
      if (idx !== array.length - 1) {
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
 * Get script for for table data.
 *
 * @param item Results from data query.
 */
export function data(item: SqlDataResult): string {
  let output: string = '';

  // idempotency
  output += `truncate table ${item.name}`;
  output += EOL;

  item.result.recordset.forEach(row => {
    const keys: string[] = Object.keys(row);
    const columns: string = keys.join(', ');
    const values: string = keys.map(key => safeValue(row[key])).join(', ');

    output += `insert into ${item.name} (${columns}) values (${values})`;
    output += EOL;
  });

  output += EOL;
  return output;
}

/**
 * Safely transform SQL value for scripting.
 *
 * @param value SQL data value.
 */
function safeValue(value: any): any {
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
 * @param item Row from `sys.columns` query.
 */
function column(item: SqlColumn): string {
  let output: string = `[${item.name}]`;

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
      output += '(' + (item.max_length === -1 ? 'max' : item.max_length) + ')';
      break;
    case 'nvarchar':
    case 'nchar':
    case 'ntext':
      output += '(' + (item.max_length === -1 ? 'max' : item.max_length / 2) + ')';
      break;
    case 'datetime2':
    case 'time2':
    case 'datetimeoffset':
      output += '(' + item.scale + ')';
      break;
    case 'decimal':
      output += '(' + item.precision + ', ' + item.scale + ')';
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
 * @param item Row from `sys.primaryKeys` query.
 */
function primaryKey(item: SqlPrimaryKey): string {
  return `constraint [${item.name}] primary key ([${item.column}] ${item.is_descending_key ? 'desc' : 'asc'})`;
}

/**
 * Get script for table's foreign key.
 *
 * @param item Row from `sys.foreignKeys` query.
 */
function foreignKey(item: SqlForeignKey): string {
  const objectId: string = `${item.schema}].[${item.table}`;
  const parentObjectId: string = `${item.parent_schema}].[${item.parent_table}`;

  let output: string = `alter table [${objectId}] with ${item.is_not_trusted ? 'nocheck' : 'check'}`;
  output += ` add constraint [${item.name}] foreign key([${item.column}])`;
  output += ` references [${parentObjectId}] ([${item.reference}])`;

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

  output += ` alter table [${objectId}] check constraint [${item.name}]`;
  return output;
}

/**
 * Get script for table's indexes.
 *
 * @param item Row from `sys.indexes` query.
 */
function index(item: SqlIndex): string {
  const objectId: string = `${item.schema}].[${item.table}`;
  let output: string = '';

  // idempotency
  // tslint:disable-next-line:max-line-length
  output += `if not exists (select * from sys.indexes where object_id = object_id('[${objectId}]') and name = '${item.name}')`;
  output += EOL;

  output += 'create';

  if (item.is_unique) {
    output += ' unique';
  }

  output += ` nonclustered index [${item.name}] on [${objectId}]`;
  output += `([${item.column}] ${item.is_descending_key ? 'desc' : 'asc'})`;

  // todo (jbl): includes

  output += EOL;
  return output;
}

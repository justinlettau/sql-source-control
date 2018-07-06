import { EOL } from 'os';
import { isBoolean, isDate, isString, isNumber, isNull } from 'ts-util-is';

import { IdempotencyOption } from '../common/idempotency';
import {
  AbstractRecordSet,
  ColumnRecordSet,
  DataRecordSet,
  ForeignKeyRecordSet,
  IndexRecordSet,
  PrimaryKeyRecordSet,
  SchemaRecordSet,
  TableRecordSet,
  DefaultConstraintRecordSet,
  FullTextCatalogRecordSet,
  FullTextStopListRecordSet,
  FullTextStopWordRecordSet,
  SynonymRecordSet,
  FullTextIndexRecordSet,
  ObjectRecordSet
} from '../sql/record-set';

/**
 * Get idempotency script prefix.
 *
 * @param item Row from query.
 * @param type Idempotency prefix type.
 */
export function idempotency(item: AbstractRecordSet, type: IdempotencyOption): string {
  let obj: string;
  const objectId: string = `${item.schema}].[${item.name}`;

  item.type = item.type.trim();

  // get proper object type for `drop` statement
  switch (item.type) {
    case 'U':
      obj = 'TABLE';
      break;
    case 'TT':
      obj = 'TABLE';
      break;
    case 'P':
      obj = 'PROCEDURE';
      break;
    case 'V':
      obj = 'VIEW';
      break;
    case 'TF':
    case 'IF':
    case 'FN':
      obj = 'FUNCTION';
      break;
    case 'TR':
      obj = 'TRIGGER';
      break;
  }

  if (type === 'if-exists-drop') {
    // if exists drop
    if (item.type === 'TT') {
      return [
        `PRINT ('CREATING ${obj} [${item.schema}].[${item.name}]')`,
        'IF EXISTS (',
        '    SELECT * FROM sys.table_types AS t',
        '    JOIN sys.schemas s ON t.schema_id = s.schema_id',
        `    WHERE t.name = '${item.name}' AND s.name = '${item.schema}'`,
        ')',
        `DROP TYPE [${objectId}]`,
        'GO',
        EOL
      ].join(EOL);
    } else {
      return [
        `PRINT ('CREATING ${obj} [${item.schema}].[${item.name}]')`,
        `IF EXISTS (SELECT * FROM sys.objects WHERE object_id = object_id('[${objectId}]') AND type = '${item.type}')`,
        `DROP ${obj} [${objectId}]`,
        'GO',
        EOL
      ].join(EOL);
    }
  } else if (type === 'if-not-exists') {
    // if not exists
    if (item.type === 'TT') {
      return [
        `PRINT ('CREATING ${obj} [${item.schema}].[${item.name}]')`,
        'IF NOT EXISTS (',
        '    SELECT * FROM sys.table_types AS t',
        '    JOIN sys.schemas s on t.schema_id = s.schema_id',
        `    WHERE t.name = '${item.name}' AND s.name = '${item.schema}'`,
        ')',
        ''
      ].join(EOL);
    } else {
      return [
        // tslint:disable-next-line:max-line-length
        `PRINT ('CREATING ${obj} [${item.schema}].[${item.name}]')`,
        `IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = object_id('[${objectId}]') AND type = '${item.type}')`,
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
export function schema(item: SchemaRecordSet): string {
  let output: string = '';

  // idempotency
  output += `IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = '${item.name}')`;
  output += EOL;

  output += `EXEC('CREATE SCHEMA ${item.name}')`;
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
  item: TableRecordSet,
  columns: ColumnRecordSet[],
  primaryKeys: PrimaryKeyRecordSet[],
  foreignKeys: ForeignKeyRecordSet[],
  indexes: IndexRecordSet[]
): string {
  let output: string = `CREATE TABLE [${item.schema}].[${item.name}]`;
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

  let pks: PrimaryKeyRecordSet[] = primaryKeys
      .filter(x => x.object_id === item.object_id);

  // primary keys
  if (pks.length > 0) {
      let pk: PrimaryKeyRecordSet = pks[0];
      output += ` CONSTRAINT [${pk.name}] PRIMARY KEY ${pk.indextype}`
      output += EOL;      
      output += '(' + EOL;

      for (var i = 0; i < pks.length; i++) {       
          let pk: PrimaryKeyRecordSet = pks[i];
          output += '    ' + primaryKey(pk);

          if (pks.length > 1 && i < pks.length - 1) {
              output += ',';
          }

          output += EOL;
      }

      output += `) WITH (PAD_INDEX = ${pk.is_padded}, IGNORE_DUP_KEY = ${pk.ignore_dup_key}, ALLOW_ROW_LOCKS = ${pk.allow_row_locks}, ALLOW_PAGE_LOCKS = ${pk.allow_page_locks}) ON [${pk.filegroup}]`;
      output += EOL
  }

  //end of create table statement
  output += `) ON [${item.filegroup}]`;
  output += EOL;
  output += 'GO';
  output += EOL;
  output += EOL;

  if (!item.lock_escalation) {
      output += `ALTER TABLE [${item.schema}].[${item.name}] SET (LOCK_ESCALATION = DISABLE)`
      output += EOL;
      output += 'GO';
      output += EOL;
      output += EOL;
  }

  // foreign keys
  //foreignKeys
  //    .filter(x => x.parent_object_id === item.object_id)
  //    .forEach(fk => {
  //        output += foreignKey(fk);
  //        output += EOL;
  //    });

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
  item: TableRecordSet,
  columns: ColumnRecordSet[]
): string {
  let output: string = `CREATE TYPE [${item.schema}].[${item.name}] AS TABLE`;
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
export function data(item: DataRecordSet, has_identity_column: boolean): string {
  let output: string = '';

  // idempotency

  output += `SET NOCOUNT ON;`;
  output += EOL;

  output += `TRUNCATE TABLE ${item.name}`;
  output += EOL;  

  output += EOL;
  output += `PRINT ('ADDING ROWS TO ${item.name}')`;
  output += EOL;

  if (has_identity_column) {
      output += `SET IDENTITY_INSERT ${item.name} ON`;
      output += EOL;
  }

  item.result.recordset.forEach(row => {
    const keys: string[] = Object.keys(row);
    const columns: string = keys.join(', ');
    const values: string = keys.map(key => safeValue(row[key])).join(', ');

    output += `INSERT INTO ${item.name} (${columns}) VALUES (${values})`;
    output += EOL;
  });

  if (has_identity_column) {
      output += `SET IDENTITY_INSERT ${item.name} OFF`;
      output += EOL;
  }

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

  if (isNumber(value)) {
    return value;
  }

  if (isNull(value)) {
    value = `NULL`;
  }

  return value;
}

/**
 * Get script for table's column.
 *
 * @param item Row from `sys.columns` query.
 */
function column(item: ColumnRecordSet): string {
  let output: string = `[${item.name}]`;

  if (item.is_computed && item.computed_definition) {
      output += ` AS ${item.computed_definition}`;

      if (item.is_persisted) {
          output += ' PERSISTED';
      }
  } else {

      output += ` [${item.datatype}]`;

      switch (item.datatype) {
          case 'varchar':
          case 'char':
          case 'varbinary':
          case 'binary':
          case 'text':
              output += '(' + (item.max_length === -1 ? 'MAX' : item.max_length) + ')';
              break;
          case 'nvarchar':
          case 'nchar':
          case 'ntext':
              output += '(' + (item.max_length === -1 ? 'MAX' : item.max_length / 2) + ')';
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
          output += ` COLLATE ${item.collation_name}`;
      }

      output += item.is_nullable ? ' NULL' : ' NOT NULL';

      if (item.is_identity) {
          output += ` IDENTITY (${item.seed_value || 0}, ${item.increment_value || 1})`;
      }
  }  

  return output;
}

/**
 * Get script for table's primary key.
 *
 * @param item Row from `sys.primaryKeys` query.
 */
function primaryKey(item: PrimaryKeyRecordSet): string {
  return `[${item.column}] ${item.is_descending_key ? 'desc' : 'asc'}`;
}

/**
 * Get script for table's foreign key.
 *
 * @param item Row from `sys.foreignKeys` query.
 */
export function foreignKey(item: ForeignKeyRecordSet): string {
  const objectId: string = `${item.constraint_schema}].[${item.constraint_table}`;
  const refObjectId: string = `${item.ref_schema}].[${item.ref_table}`;

  let output: string = `PRINT ('CREATING FOREIGN KEY ${item.name}')`;
  output += EOL;

  output += `ALTER TABLE [${objectId}] WITH ${item.check_constraint}`;
  output += ` ADD CONSTRAINT [${item.name}] FOREIGN KEY (${item.constraint_columns})`;
  output += EOL;
  output += `REFERENCES [${refObjectId}] (${item.ref_columns})`;

  if (item.delete_referential_action.length > 0) {
      output += EOL;
      output += item.delete_referential_action;      
  }

  if (item.update_referential_action.length > 0) {
      output += EOL;
      output += item.update_referential_action;
  }

  if (item.is_not_for_replication) {
      output += ' NOT FOR REPLICATION';
  }

  output += EOL;
  output += 'GO';

  output += EOL;
  output += EOL;

  let checkValue = item.is_disabled ? 'NOCHECK' : 'CHECK';

  output += `ALTER TABLE [${objectId}] ${checkValue} CONSTRAINT [${item.name}]`;
  output += EOL;
  output += 'GO';

  output += EOL;
  output += EOL;

  return output;
}

/**
 * Get script to drop existing foreign key.
 *
 * @param item Row from `sys.foreignKeys` query.
 */
export function dropForeignKey(item: ForeignKeyRecordSet): string {
    const objectId: string = `${item.constraint_schema}].[${item.constraint_table}`;

    let output: string = [
        `IF EXISTS (SELECT * FROM sys.objects WHERE name = '${item.name}')`,
        'BEGIN',
        `  ALTER TABLE [${objectId}] DROP CONSTRAINT [${item.name}]`,
        'END',
        'GO',
        EOL].join(EOL);

    return output;
}

/**
 * Get script to drop existing procedure
 *
 * @param item Row from `sys.objects` query.
 */
export function dropProcedure(item: AbstractRecordSet): string {
    let output: string = [
        `IF EXISTS (SELECT * FROM sys.objects o `,
        `           INNER JOIN sys.schemas s on o.schema_id = s.schema_id `,
        `           WHERE o.name = '${item.name}' and s.name = '${item.schema}')`,
        'BEGIN',
        `  DROP PROCEDURE [${item.schema}].[${item.name}]`,
        'END',
        'GO',
        EOL].join(EOL);

    return output;
}

/**
 * Get script to drop existing constraint.
 *
 * @param item Row from `sys.default_constraints` query.
 */
export function dropConstraint(item: DefaultConstraintRecordSet): string {
    const objectId: string = `${item.schema}].[${item.table_name}`;

    let output: string = [
        `IF EXISTS (SELECT * FROM sys.objects WHERE name = '${item.constraint_name}')`,
        'BEGIN',
        `  ALTER TABLE [${objectId}] DROP CONSTRAINT [${item.constraint_name}]`,
        'END',
        'GO',
        EOL].join(EOL);

    return output;
}

/**
 * Get script to drop existing fulltext catalogs.
 *
 * @param item Row from `sys.fulltext_catalogs` query.
 */
export function dropFulltextCatalog(item: FullTextCatalogRecordSet): string {
    let output: string = [
        `IF EXISTS (SELECT * FROM sys.fulltext_catalogs WHERE name = '${item.name}')`,
        `AND NOT EXISTS (SELECT * FROM sys.fulltext_catalogs c INNER JOIN sys.fulltext_indexes i on c.fulltext_catalog_id = i.fulltext_catalog_id WHERE c.name = '${item.name}')`,
        'BEGIN',
        `  DROP FULLTEXT CATALOG [${item.name}]`,
        'END',
        'GO',
        EOL].join(EOL);

    return output;
}

export function getStatement(item: ObjectRecordSet): string {
    let output: string = [
        item.text,
        'GO',
        EOL].join(EOL);

    return output;
}

/**
 * Get script to create constraint.
 *
 * @param item Row from `sys.default_constraints` query.
 */
export function constraint(item: DefaultConstraintRecordSet): string {
    const objectId: string = `${item.schema}].[${item.table_name}`;

    let output: string = `PRINT ('CREATING DEFAULT CONSTRAINT ${item.constraint_name}')`;
    output += EOL;

    output += `ALTER TABLE [${objectId}] ADD CONSTRAINT [${item.constraint_name}] DEFAULT ${item.definition} FOR [${item.column_name}]`;
    output += EOL;
    output += "GO";
    output += EOL;
    output += EOL;

    return output;
}

/**
 * Get script to create full text catalog.
 *
 * @param item Row from `sys.fulltext_catalog` query.
 */
export function fullTextCatalog(item: FullTextCatalogRecordSet): string {
  let output: string = [
    `PRINT ('CREATING FULL TEXT CATALOG ${item.name}')`,
    `IF NOT EXISTS (SELECT * FROM sys.fulltext_catalogs where name = '${item.name}')`,
    'BEGIN',
    `  CREATE FULLTEXT CATALOG [${item.name}] WITH ACCENT_SENSITIVITY = ${item.accent_sensitivity}`,
    'END',
    'GO',
    EOL].join(EOL);

    return output;
}

/**
 * Get script to create full text indexes.
 *
 * @param item Row from `sys.fulltext_index` query.
 */
export function fullTextIndex(item: FullTextIndexRecordSet): string {
    let output: string = [
        `IF NOT EXISTS (SELECT * FROM sys.fulltext_indexes where object_id = object_id('${item.scheme}.${item.table_name}'))`,
        'BEGIN',
        `  ${item.sql_value}`,
        'END',
        'GO',
        EOL].join(EOL);

    return output;
}

export function dropFulltextIndex(item: FullTextIndexRecordSet): string {
    let output: string = [
        `IF EXISTS (SELECT * FROM sys.fulltext_indexes where object_id = object_id('${item.scheme}.${item.table_name}'))`,
        'BEGIN',
        `  DROP FULLTEXT INDEX ON ${item.scheme}.${item.table_name}`,
        'END',
        'GO',
        EOL].join(EOL);

    return output;
}

/**
 * Get script to create full text stoplist.
 *
 * @param item Row from `sys.fulltext_stoplist` query.
 * @param stopWords Array of items from `sys.fulltext_stopwords` query.
 */
export function fullTextStopList(item: FullTextStopListRecordSet, stopWords: FullTextStopWordRecordSet[]): string {
    let words: FullTextStopWordRecordSet[] = stopWords.filter(a => a.stoplist_id == item.stoplist_id);
    let output: string = '';

    if (words.length > 0) {
        output += [
            `IF EXISTS (SELECT * FROM sys.fulltext_stoplists WHERE name = '${item.name}')`,
            'BEGIN',
            `  DROP FULLTEXT STOPLIST [${item.name}];`,
            'END',
            'GO',
            EOL].join(EOL);

        output += `PRINT ('Creating full text stop list ${item.name}')`;
        output += EOL;

        output += [`CREATE FULLTEXT STOPLIST [${item.name}]`,
            ';',
            EOL
        ].join(EOL);

        words.forEach(wordItem => { 
            output += `ALTER FULLTEXT STOPLIST [${wordItem.name}] ADD '${wordItem.stopword}' LANGUAGE '${wordItem.language}';`;
            output += EOL;
        });

        output += 'GO';
        output += EOL;
    }

    return output;
}

/**
 * Get script to drop synonyms.
 *
 * @param synonyms Row from `sys.synonyms` query.
 */
export function dropSynonyms(item: SynonymRecordSet): string {
    let output: string = [
        `IF EXISTS (SELECT * FROM sys.synonyms WHERE name = N'${item.name}' AND schema_id = SCHEMA_ID(N'${item.schema}'))`,
        'BEGIN',
        `  DROP SYNONYM [${item.schema}].[${item.name}]`,
        'END',
        'GO',
        EOL].join(EOL);

    return output;
}

/**
 * Get script for synonyms.
 *
 * @param synonyms Row from `sys.synonyms` query.
 */
export function synonym(item: SynonymRecordSet): string {
    let output: string = [
        `CREATE SYNONYM [${item.schema}].[${item.name}] FOR [{synonym_target}]${item.reference}`,
        `GO`,
        EOL].join(EOL);

    return output;
}

/**
 * Get script for table's indexes.
 *
 * @param item Row from `sys.indexes` query.
 */
function index(item: IndexRecordSet): string {
  const objectId: string = `${item.schema}].[${item.table}`;
  let output: string = '';

  // idempotency
  // tslint:disable-next-line:max-line-length
  output += `IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = object_id('[${objectId}]') AND name = '${item.name}')`;
  output += EOL;
  output += 'BEGIN';
  output += EOL;

  if (item.is_unique_constraint) {
      output += `ALTER TABLE [${objectId}] ADD CONSTRAINT [${item.name}] UNIQUE ${item.indextype}  (${item.columns})`;
      output += EOL;
  } else {
      output += 'CREATE';

      if (item.is_unique) {
          output += ' UNIQUE';
      }

      output += ` ${item.indextype} INDEX [${item.name}] ON [${objectId}]`;
      output += `(${item.columns})`;

      if (item.included_columns && item.included_columns.length > 0) {
          output += ` INCLUDE (${item.included_columns})`
      }

      output += EOL;
  }

  output += 'END';
  output += EOL;

  output += 'GO';
  return output;
}

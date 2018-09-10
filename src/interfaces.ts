import * as sql from 'mssql';

/**
 * CLI arguments for `init` command.
 */
export interface InitOptions {
  webconfig?: string;
  force?: boolean;
  skip?: boolean;
}

/**
 * Base SQL object.
 */
export interface AbstractSqlObject {
  object_id: number;
  type: string;
  schema: string;
  name: string;
}

/**
 * SQL schema object.
 */
export interface SqlSchema {
  name: string;
  type: string;
}

/**
 * SQL data results.
 */
export interface SqlDataResult {
  name: string;
  type: string;
  result: sql.IResult<any>;
}

/**
 * SQL table object.
 */
// tslint:disable-next-line:no-empty-interface
export interface SqlTable extends AbstractSqlObject { }

/**
 * SQL Table valued parameter.
 */
// tslint:disable-next-line:no-empty-interface
export interface SqlTableValuedParameter extends AbstractSqlObject { }

/**
 * SQL column object.
 */
export interface SqlColumn {
  object_id: number;
  name: string;
  datatype: string;
  max_length: number;
  is_computed: boolean;
  precision: number;
  scale: string;
  collation_name: string;
  is_nullable: boolean;
  definition: string;
  is_identity: boolean;
  seed_value: number;
  increment_value: number;
  formula: string;
}

/**
 * SQL primary key object.
 */
export interface SqlPrimaryKey {
  object_id: number;
  is_descending_key: boolean;
  name: string;
  column: string;
}

/**
 * SQL foreign key object.
 */
export interface SqlForeignKey {
  object_id: number;
  constraint_object_id: number;
  is_not_trusted: boolean;
  column: string;
  reference: string;
  name: string;
  schema: string;
  table: string;
  parent_schema: string;
  parent_table: string;
  delete_referential_action: number;
  update_referential_action: number;
}

/**
 * SQL index object.
 */
export interface SqlIndex {
  object_id: number;
  index_id: number;
  is_descending_key: boolean;
  is_included_column: boolean;
  is_unique: boolean;
  name: string;
  column: string;
  schema: string;
  table: string;
}

/**
 * SQL object.
 */
export interface SqlObject extends AbstractSqlObject {
  text: string;
}

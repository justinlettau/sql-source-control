import * as sql from 'mssql';

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
}

/**
 * SQL data results.
 */
export interface SqlDataResult {
  name: string;
  hasIdentity: number;
  result: sql.IResult<any>;
}

/**
 * SQL table object.
 */
export interface SqlTable extends AbstractSqlObject {
  identity_count: number;
}

/**
 * SQL type.
 */
export interface SqlType extends AbstractSqlObject {
  system_type: string;
  max_length: number;
  precision: number;
  scale: boolean;
  is_nullable: boolean;
}

/**
 * SQL column object.
 */
export interface SqlColumn {
  object_id: number;
  name: string;
  datatype: string;
  is_user_defined: boolean;
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
  type: 'CLUSTERED' | 'NONCLUSTERED' | 'HEAP';
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

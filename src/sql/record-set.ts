import * as sql from 'mssql';

/**
 * Base record set for record sets.
 */
export interface AbstractRecordSet {
  object_id: number;
  type: string;
  schema: string;
  name: string;
  filegroup: string;
  lock_escalation: boolean;
}

/**
 * Mock schema record set, properties from table query.
 */
export interface SchemaRecordSet {
  name: string;
  type: string;
}

/**
 * Mock data record set.
 */
export interface DataRecordSet {
  name: string;
  type: string;
  result: sql.IResult<any>;
}

/**
 * Dataset returned from table query.
 */
// tslint:disable-next-line:no-empty-interface
export interface TableRecordSet extends AbstractRecordSet { }

/**
 * Dataset returned from user-defined table-valued parameter query.
 */
// tslint:disable-next-line:no-empty-interface
export interface TvpRecordSet extends AbstractRecordSet { }

/**
 * Dataset returned from column query.
 */
export interface ColumnRecordSet {
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
  computed_definition: string;
  is_persisted: boolean;
}

/**
 * Dataset returned from primary key query.
 */
export interface PrimaryKeyRecordSet {
  object_id: number;
  is_descending_key: boolean;
  name: string;
  column: string;
  indextype: string;
  filegroup: string;
  allow_page_locks: string;
  allow_row_locks: string;
  ignore_dup_key: string;
  is_padded: string;
}

/**
 * Dataset returned from foreign query.
 */
export interface ForeignKeyRecordSet {
  object_id: number;
  parent_object_id: number;
  check_constraint: string;
  constraint_schema: string;
  constraint_table: string;
  name: string;
  constraint_columns: string;
  ref_schema: string;
  ref_table: string;
  ref_columns: string;
  delete_referential_action: string;
  update_referential_action: string;
  is_not_for_replication: boolean;
  is_disabled: boolean;
}

/**
 * Dataset returned from index query.
 */
export interface IndexRecordSet {
  object_id: number;
  index_id: number;
  is_descending_key: boolean;
  is_included_column: boolean;
  is_unique: boolean;
  name: string;
  columns: string;
  schema: string;
  table: string;
  indextype: string;
  is_unique_constraint: boolean;
  included_columns: string;
}

/**
 * Dataset returned from object query.
 */
export interface ObjectRecordSet extends AbstractRecordSet {
  text: string;
}

export interface FullTextCatalogRecordSet {
  name: string;
  accent_sensitivity: string;
}

export interface FullTextStopListRecordSet {
  stoplist_id: number;
  name: string;
}

export interface FullTextStopWordRecordSet {
  stoplist_id: number;
  name: string;
  stopword: string;
  language: string;
}

export interface DefaultConstraintRecordSet {
  schema: string;
  table_name: string;
  column_name: string;
  constraint_name: string;
  definition: string;
}

export interface SynonymRecordSet {
  schema: string;
  name: string;
  reference: string;
}

export interface FullTextIndexRecordSet {
  scheme: string;
  table_name: string;
  sql_value: string;
}

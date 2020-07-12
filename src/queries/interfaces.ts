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
  schema: string;
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
  default_name: string;
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

/**
 * SQL job.
 */
export interface SqlJob {
  job_id: string;
  enabled: boolean;
  name: string;
  description: string;
  notify_level_eventlog: number;
  notify_level_email: number;
  notify_level_netsend: number;
  notify_level_page: number;
  delete_level: number;
}

/**
 * SQL job step.
 */
export interface SqlJobStep {
  job_id: string;
  job_name: string;
  step_uid: string;
  step_number: number;
  step_name: string;
  subsystem: string;
  command: string;
  additional_parameters: string;
  cmdexec_success_code: number;
  on_success_action: number;
  on_success_step_id: number;
  on_fail_action: number;
  on_fail_step_id: number;
  database_name: string;
  database_user_name: string;
  retry_attempts: number;
  retry_interval: number;
  os_run_priority: number;
  flags: number;
}

/**
 * SQL job schedule.
 */
export interface SqlJobSchedule {
  job_id: string;
  schedule_uid: string;
  schedule_name: string;
  enabled: boolean;
  freq_type: number;
  freq_interval: number;
  freq_subday_type: number;
  freq_subday_interval: number;
  freq_relative_interval: number;
  freq_recurrence_factor: number;
  active_start_date: number;
  active_end_date: number;
  active_start_time: number;
  active_end_time: number;
}

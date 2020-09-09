/* tslint:disable:max-line-length */
import { EOL } from 'os';
import { isBoolean, isDate, isNull, isString } from 'ts-util-is';

import Config from '../common/config';
import { Helpers } from '../common/helpers';
import {
  SqlColumn,
  SqlDataResult,
  SqlForeignKey,
  SqlIndex,
  SqlJob,
  SqlJobSchedule,
  SqlJobStep,
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
  data(item: SqlDataResult) {
    let output = '';

    switch (this.config.idempotency.data) {
      case 'delete':
        output += `DELETE FROM [${item.schema}].[${item.name}]` + EOL;
        output += EOL;
        break;
      case 'delete-and-reseed':
        output += `DELETE FROM [${item.schema}].[${item.name}]`;
        output += EOL;
        output += `DBCC CHECKIDENT ('[${item.schema}].[${item.name}]', RESEED, 0)`;
        output += EOL;
        break;
      case 'truncate':
        output += `TRUNCATE TABLE [${item.schema}].[${item.name}]`;
        output += EOL;
        break;
    }

    output += EOL;

    if (item.hasIdentity) {
      output += `SET IDENTITY_INSERT [${item.schema}].[${item.name}] ON`;
      output += EOL;
      output += EOL;
    }

    item.result.recordset.forEach(row => {
      const keys = Object.keys(row);
      const columns = keys.join(', ');
      const values = keys.map(key => this.safeValue(row[key])).join(', ');

      output += `INSERT INTO [${item.schema}].[${item.name}] (${columns}) VALUES (${values})`;
      output += EOL;
    });

    if (item.hasIdentity) {
      output += EOL;
      output += `SET IDENTITY_INSERT [${item.schema}].[${item.name}]
       OFF`;
      output += EOL;
    }

    output += EOL;
    return output;
  }

  /**
   * Get function file content.
   *
   * @param item Row from query.
   */
  function(item: SqlObject) {
    const objectId = `[${item.schema}].[${item.name}]`;
    const type = item.type.trim();
    let output = '';

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
  storedProcedure(item: SqlObject) {
    const objectId = `[${item.schema}].[${item.name}]`;
    const type = item.type.trim();
    let output = '';

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
  schema(item: SqlSchema) {
    let output = '';

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
  table(
    item: SqlTable,
    columns: SqlColumn[],
    primaryKeys: SqlPrimaryKey[],
    foreignKeys: SqlForeignKey[],
    indexes: SqlIndex[]
  ) {
    const objectId = `[${item.schema}].[${item.name}]`;
    const type = item.type.trim();
    let output = '';

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
        output += this.indent() + this.column(col) + ',';
        output += EOL;
      });

    primaryKeys = primaryKeys.filter(x => x.object_id === item.object_id);
    foreignKeys = foreignKeys.filter(x => x.object_id === item.object_id);
    indexes = indexes.filter(x => x.object_id === item.object_id);

    const groupedKeys = Helpers.groupByName(primaryKeys, 'name');
    Object.keys(groupedKeys).forEach(name => {
      output += this.primaryKey(groupedKeys[name]);
      output += EOL;
    });

    output += ')';

    if (foreignKeys.length || indexes.length) {
      output += EOL;
      output += EOL;
    }

    foreignKeys.forEach(fk => {
      output += this.foreignKey(fk);
      output += EOL;
    });

    const groupedIndexes = Helpers.groupByName(indexes, 'name');
    Object.keys(groupedIndexes).forEach(name => {
      output += this.index(groupedIndexes[name]);
      output += EOL;
    });

    return output;
  }

  /**
   * Get trigger file content.
   *
   * @param item Row from query.
   */
  trigger(item: SqlObject) {
    const objectId = `[${item.schema}].[${item.name}]`;
    const type = item.type.trim();
    let output = '';

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
   */
  type(item: SqlType) {
    const objectId = `[${item.schema}].[${item.name}]`;
    let output = '';

    switch (this.config.idempotency.types) {
      case 'if-exists-drop':
        output += 'IF EXISTS (';
        output += EOL;
        output += this.indent() + 'SELECT 1 FROM sys.types AS t';
        output += EOL;
        output += this.indent() + 'JOIN sys.schemas s ON t.schema_id = s.schema_id';
        output += EOL;
        output += this.indent() + `WHERE t.name = '${item.name}' AND s.name = '${item.schema}'`;
        output += EOL;
        output += ')';
        output += EOL;
        output += `DROP TYPE ${item.name}`;
        output += EOL;
        output += 'GO';
        output += EOL;
        break;
      case 'if-not-exists':
        output += `IF NOT EXISTS (`;
        output += EOL;
        output += this.indent() + 'SELECT 1 FROM sys.types AS t';
        output += EOL;
        output += this.indent() + 'JOIN sys.schemas s ON t.schema_id = s.schema_id';
        output += EOL;
        output += this.indent() + `WHERE t.name = '${item.name}' AND s.name = '${item.schema}'`;
        output += EOL;
        output += ')';
        output += EOL;
        break;
    }

    output += `CREATE TYPE ${objectId}`;
    output += EOL;
    output += `FROM ${item.system_type.toUpperCase()}`;

    switch (item.system_type) {
      case 'char':
      case 'nvarchar':
      case 'varchar':
        output += `(${item.max_length === -1 ? 'max' : item.max_length})`;
        break;
      case 'decimal':
      case 'numeric':
        output += `(${item.scale},${item.precision})`;
        break;
    }

    output += item.is_nullable ? ' NULL' : ' NOT NULL';

    return output;
  }

  /**
   * Get table type file content.
   *
   * @param item Row from query.
   * @param columns Columns from query.
   */
  tableType(item: SqlType, columns: SqlColumn[]) {
    const objectId = `[${item.schema}].[${item.name}]`;
    const type = item.type.trim();
    let output = '';

    switch (this.config.idempotency.types) {
      case 'if-exists-drop':
        output += 'IF EXISTS (';
        output += EOL;
        output += this.indent() + 'SELECT 1 FROM sys.table_types AS t';
        output += EOL;
        output += this.indent() + 'JOIN sys.schemas s ON t.schema_id = s.schema_id';
        output += EOL;
        output += this.indent() + `WHERE t.name = '${item.name}' AND s.name = '${item.schema}'`;
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
        output += this.indent() + this.column(col);

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
  view(item: SqlObject) {
    const objectId = `[${item.schema}].[${item.name}]`;
    const type = item.type.trim();
    let output = '';

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
   * Get job file content.
   *
   * @param steps Steps from query.
   * @param schedules Schedules from query.
   */
  job(job: SqlJob, steps: SqlJobStep[], schedules: SqlJobSchedule[]) {
    let output = '';

    switch (this.config.idempotency.views) {
      case 'if-exists-drop':
        output += `IF EXISTS (SELECT 1 FROM msdb.dbo.sysjobs WHERE name = '${job.name}')`;
        output += EOL;
        output += `EXEC msdb.dbo.sp_delete_job @job_name = '${job.name}'`;
        output += EOL;
        output += 'GO';
        output += EOL;
        output += EOL;
        output += this.addJob(job, steps, schedules);
        output += EOL;
        break;
      case 'if-not-exists':
        output += `IF NOT EXISTS (SELECT 1 FROM msdb.dbo.sysjobs WHERE name = '${job.name}')`;
        output += EOL;
        output += 'BEGIN';
        output += EOL;
        output += this.addJob(job, steps, schedules);
        output += EOL;
        output += 'END';
        output += EOL;
        break;
    }

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
  private column(item: SqlColumn) {
    let output = `[${item.name}]`;
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
        size = item.max_length === -1 ? 'max' : item.max_length;
        output += `(${size})`;
        break;
      case 'nvarchar':
      case 'nchar':
      case 'ntext':
        size = item.max_length === -1 ? 'max' : item.max_length / 2;
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

    if (item.collation_name && !item.is_user_defined) {
      output += ` COLLATE ${item.collation_name}`;
    }

    output += item.is_nullable ? ' NULL' : ' NOT NULL';

    if (item.definition) {
      if (this.config.includeConstraintName && item.default_name) {
        output += ` CONSTRAINT [${item.default_name}]`;
      }

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
   * @param items Rows from query.
   */
  private primaryKey(items: SqlPrimaryKey[]) {
    const first = items[0];
    let output = '';

    output += this.indent() + `CONSTRAINT [${first.name}] PRIMARY KEY `;

    switch (first.type) {
      case 'CLUSTERED':
        output += 'CLUSTERED ';
        break;
      case 'NONCLUSTERED':
        output += 'NONCLUSTERED ';
        break;
    }

    if (items.length > 1) {
      output += EOL;
      output += this.indent() + '(';
      output += EOL;

      items.forEach((item, idx, array) => {
        output += this.indent(2) + this.primaryKeyColumn(item);

        if (idx !== array.length - 1) {
          // not the last column
          output += ',';
        }

        output += EOL;
      });

      output += this.indent() + ')';
    } else {
      output += '(' + this.primaryKeyColumn(first) + ')';
    }

    return output;
  }

  /**
   * Get script for an individual primary key column.
   *
   * @param item Row from query.
   */
  private primaryKeyColumn(item: SqlPrimaryKey) {
    const direction = item.is_descending_key ? 'DESC' : 'ASC';
    return `[${item.column}] ${direction}`;
  }

  /**
   * Get script for table's foreign key.
   *
   * @param item Row from foreignKeys query.
   */
  private foreignKey(item: SqlForeignKey): string {
    const objectId = `[${item.schema}].[${item.table}]`;
    const keyObjectId = `[${item.schema}].[${item.name}]`;
    const parentObjectId = `[${item.parent_schema}].[${item.parent_table}]`;
    let output = '';

    output += `IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('${keyObjectId}') AND parent_object_id = OBJECT_ID('${objectId}'))`;
    output += EOL;
    output += 'BEGIN';
    output += EOL;

    output += this.indent() + `ALTER TABLE ${objectId} WITH ${item.is_not_trusted ? 'NOCHECK' : 'CHECK'}`;
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
    output += this.indent() + `ALTER TABLE ${objectId} CHECK CONSTRAINT [${item.name}]`;
    output += EOL;
    output += 'END';
    output += EOL;

    return output;
  }

  /**
   * Get script for table's index.
   *
   * @param items Rows from query.
   */
  private index(items: SqlIndex[]) {
    const first = items[0];
    const objectId = `[${first.schema}].[${first.table}]`;
    let output = '';

    output += `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('${objectId}') AND name = '${first.name}')`;
    output += EOL;
    output += 'CREATE';

    if (first.is_unique) {
      output += ' UNIQUE';
    }

    output += ` ${first.index_type} INDEX [${first.name}] ON ${objectId}`;
    output += '(';

    if (items.length > 1) {
      output += EOL;

      items.forEach((item, idx, array) => {
        output += this.indent() + this.indexColumn(item);

        if (idx !== array.length - 1) {
          // not the last column
          output += ',';
        }

        output += EOL;
      });
    } else {
      output += this.indexColumn(first);
    }

    output += ')';
    output += EOL;

    return output;
  }

  /**
   * Get script for an individual index column.
   *
   * @param item Row from query.
   */
  private indexColumn(item: SqlIndex) {
    const direction = item.is_descending_key ? 'DESC' : 'ASC';
    return `[${item.column}] ${direction}`;
  }

  /**
   * Get job file content.
   *
   * @param steps Steps from query.
   * @param schedules Schedules from query.
   */
  private addJob(job: SqlJob, steps: SqlJobStep[], schedules: SqlJobSchedule[]) {
    let output = '';

    // job
    output += 'EXEC msdb.dbo.sp_add_job ';
    output += EOL;
    output += this.indent() + `@job_name = N'${job.name}',`;
    output += EOL;
    output += this.indent() + `@enabled = ${job.enabled},`;
    output += EOL;
    output += this.indent() + `@description = N'${job.description}',`;
    output += EOL;
    output += this.indent() + `@notify_level_eventlog = ${job.notify_level_eventlog},`;
    output += EOL;
    output += this.indent() + `@notify_level_email = ${job.notify_level_email},`;
    output += EOL;
    output += this.indent() + `@notify_level_netsend = ${job.notify_level_netsend},`;
    output += EOL;
    output += this.indent() + `@notify_level_page = ${job.notify_level_page},`;
    output += EOL;
    output += this.indent() + `@delete_level = ${job.delete_level};`;
    output += EOL;
    output += 'GO';
    output += EOL;
    output += EOL;

    // steps
    steps.forEach(step => {
      output += 'EXEC msdb.dbo.sp_add_jobstep';
      output += EOL;
      output += this.indent() + `@job_name = N'${step.job_name}',`;
      output += EOL;
      output += this.indent() + `@step_name = N'${step.step_name}',`;
      output += EOL;
      output += this.indent() + `@subsystem = N'${step.subsystem}',`;
      output += EOL;
      output += this.indent() + `@command = N'${step.command}',`;
      output += EOL;

      if (step.additional_parameters) {
        output += this.indent() + `@additional_parameters = N'${step.additional_parameters}',`;
        output += EOL;
      }

      output += this.indent() + `@cmdexec_success_code = ${step.cmdexec_success_code},`;
      output += EOL;
      output += this.indent() + `@on_success_action = ${step.on_success_action},`;
      output += EOL;
      output += this.indent() + `@on_success_step_id = ${step.on_success_step_id},`;
      output += EOL;
      output += this.indent() + `@on_fail_action = ${step.on_fail_action},`;
      output += EOL;
      output += this.indent() + `@on_fail_step_id = ${step.on_fail_step_id},`;
      output += EOL;
      output += this.indent() + `@database_name = N'${step.database_name}',`;
      output += EOL;

      if (step.database_user_name) {
        output += this.indent() + `@database_user_name = N'${step.database_user_name}',`;
        output += EOL;
      }

      output += this.indent() + `@retry_attempts = ${step.retry_attempts},`;
      output += EOL;
      output += this.indent() + `@retry_interval = ${step.retry_interval},`;
      output += EOL;
      output += this.indent() + `@os_run_priority = ${step.os_run_priority},`;
      output += EOL;
      output += this.indent() + `@flags = ${step.flags};`;
      output += EOL;
      output += 'GO';
      output += EOL;
      output += EOL;
    });

    // schedule
    if (schedules.length) {
      output += 'EXEC msdb.dbo.sp_add_schedule';
      output += EOL;

      schedules.forEach(schedule => {
        output += this.indent() + `@schedule_name = N'${schedule.schedule_name}',`;
        output += EOL;
        output += this.indent() + `@enabled = ${schedule.enabled},`;
        output += EOL;
        output += this.indent() + `@freq_type = ${schedule.freq_type},`;
        output += EOL;
        output += this.indent() + `@freq_interval = ${schedule.freq_interval},`;
        output += EOL;
        output += this.indent() + `@freq_subday_type = ${schedule.freq_subday_type},`;
        output += EOL;
        output += this.indent() + `@freq_subday_interval = ${schedule.freq_subday_interval},`;
        output += EOL;
        output += this.indent() + `@freq_relative_interval = ${schedule.freq_relative_interval},`;
        output += EOL;
        output += this.indent() + `@freq_recurrence_factor = ${schedule.freq_recurrence_factor},`;
        output += EOL;
        output += this.indent() + `@active_start_date = ${schedule.active_start_date},`;
        output += EOL;
        output += this.indent() + `@active_end_date = ${schedule.active_end_date},`;
        output += EOL;
        output += this.indent() + `@active_start_time = ${schedule.active_start_time},`;
        output += EOL;
        output += this.indent() + `@active_end_time = ${schedule.active_end_time};`;
        output += EOL;
      });

      output += 'GO';
      output += EOL;
      output += EOL;

      // attach
      const scheduleName = schedules[0].schedule_name;

      output += 'EXEC msdb.dbo.sp_attach_schedule';
      output += EOL;
      output += this.indent() + `@job_name = N'${job.name}',`;
      output += EOL;
      output += this.indent() + `@schedule_name = N'${scheduleName}';`;
      output += EOL;
      output += 'GO';
      output += EOL;
      output += EOL;
    }

    // job server
    output += 'EXEC msdb.dbo.sp_add_jobserver';
    output += EOL;
    output += this.indent() + `@job_name = N'${job.name}';`;
    output += EOL;
    output += 'GO';
    output += EOL;

    return output;
  }

  /**
   * Generate indentation spacing.
   *
   * @param count Number of levels to indent.
   */
  private indent(count = 1) {
    return '    '.repeat(count);
  }
}

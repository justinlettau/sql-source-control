import { EOL } from 'os';

import { IdempotencyOption } from '../common/idempotency';
import {
    AbstractRecordSet,
    ColumnRecordSet,
    ForeignKeyRecordSet,
    IndexRecordSet,
    ObjectRecordSet,
    PrimaryKeyRecordSet,
    SchemaRecordSet,
    TableRecordSet
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
            obj = 'table';
            break;
        case 'P':
            obj = 'procedure';
            break;
        case 'V':
            obj = 'view';
            break;
        case 'TF':
        case 'FN':
            obj = 'function';
            break;
        case 'TR':
            obj = 'trigger';
            break;
    }

    if (type === 'if-exists-drop') {
        // if exists drop
        return [
            `if exists (select * from sys.objects where object_id = object_id('[${objectId}]') and type = '${item.type}')`,
            `drop ${obj} [${objectId}]`,
            'go',
            EOL
        ].join(EOL);
    } else if (type === 'if-not-exists') {
        // if not exists
        return [
            `if not exists (select * from sys.objects where object_id = object_id('[${objectId}]') and type = '${item.type}')`,
            ''
        ].join(EOL);
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
    output += `if not exists (select * from sys.schemas where name = '${item.name}')`;
    output += EOL;

    output += `create schema ${item.name}`;
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
    let output: string = `create table [${item.schema}].[${item.name}]`;
    output += EOL;
    output += '(';
    output += EOL;

    // columns
    for (const col of columns.filter(x => x.object_id === item.object_id)) {
        output += '    ' + column(col);
        output += EOL;
    }

    // primary keys
    for (const pk of primaryKeys.filter(x => x.object_id === item.object_id)) {
        output += '    ' + primaryKey(pk);
        output += EOL;
    }

    // foreign keys
    for (const fk of foreignKeys.filter(x => x.object_id === item.object_id)) {
        output += '    ' + foreignKey(fk);
        output += EOL;
    }

    output += ')';
    output += EOL;
    output += EOL;

    // indexes
    for (const ix of indexes.filter(x => x.object_id === item.object_id)) {
        output += index(ix);
        output += EOL;
    }

    return output;
}

/**
 * Get script for table's column.
 *
 * @param item Row from `sys.columns` query.
 */
function column(item: ColumnRecordSet): string {
    let output: string = `[${item.name}]`;

    if (item.is_computed) {
        output += ` as ${item.definition}`;
    }

    output += ` ${item.datatype}`;

    switch (item.datatype) {
        case 'varchar':
            break;
        case 'char':
            output += '(' + (item.max_length === -1 ? 'max' : item.max_length) + ')';
            break;
        case 'varbinary': break;
        case 'binary': break;
        case 'text': break;
        case 'nvarchar': break;
        case 'nchar':
            output += '(' + (item.max_length === -1 ? 'max' : item.max_length / 2) + ')';
            break;
        case 'ntext': break;
        case 'datetime2': break;
        case 'time2': break;
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

    output += ',';
    return output;
}

/**
 * Get script for table's primary key.
 *
 * @param item Row from `sys.primaryKeys` query.
 */
function primaryKey(item: PrimaryKeyRecordSet): string {
    return `constraint [${item.name}] primary key ([${item.column}] ${item.is_descending_key ? 'desc' : 'asc'})`;
}

/**
 * Get script for table's foreign key.
 *
 * @param item Row from `sys.foreignKeys` query.
 */
function foreignKey(item: ForeignKeyRecordSet): string {
    const objectId: string = `${item.schema}].[${item.table}`;

    let output: string = `alter table [${objectId}] with ${item.is_not_trusted ? 'nocheck' : 'check'}`;
    output += ` add constraint [${item.name}] foreign key([${item.column}])`;
    output += ` references [${objectId}] ([${item.reference}])`;

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
function index(item: IndexRecordSet): string {
    const objectId: string = `${item.schema}].[${item.table}`;
    let output: string = '';

    // idempotency
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

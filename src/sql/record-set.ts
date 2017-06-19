/**
 * Base record set for record sets.
 */
export interface AbstractRecordSet {
    object_id: number;
    type: string;
    schema: string;
    name: string;
}

/**
 * Mock dataset, properties from table query.
 */
export interface SchemaRecordSet {
    name: string;
    type: string;
}

/**
 * Dataset returned from table query.
 */
export interface TableRecordSet extends AbstractRecordSet {

}

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
}

/**
 * Dataset returned from primary key query.
 */
export interface PrimaryKeyRecordSet {
    object_id: number;
    is_descending_key: boolean;
    name: string;
    column: string;
}

/**
 * Dataset returned from foreign query.
 */
export interface ForeignKeyRecordSet {
    object_id: number;
    constraint_object_id: number;
    is_not_trusted: boolean;
    column: string;
    reference: string;
    name: string;
    schema: string;
    table: string;
    delete_referential_action: number;
    update_referential_action: number;
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
    column: string;
    schema: string;
    table: string;
}

/**
 * Dataset returned from object query.
 */
export interface ObjectRecordSet extends AbstractRecordSet {
    text: string;
}

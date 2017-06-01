/**
 * Get SQL table information.
 */
export const tableRead: string = `
    select
        o.object_id,
        o.type,
        s.name as [schema],
        o.name
    from
        sys.objects o
        join sys.schemas s on o.schema_id = s.schema_id
    where
        o.type = 'U'
        and o.is_ms_shipped = 0
    order by
        s.name,
        o.name
`;

/**
 * Get SQL column information.
 */
export const columnRead: string = `
    select
        c.object_id,
        c.name,
        tp.name as [datatype],
        c.max_length,
        c.is_computed,
        c.precision,
        c.scale as scale,
        c.collation_name,
        c.is_nullable,
        dc.definition,
        ic.is_identity,
        ic.seed_value,
        ic.increment_value
    from
        sys.columns c
        join sys.types tp on c.user_type_id = tp.user_type_id
        left join sys.computed_columns cc on c.object_id = cc.object_id and c.column_id = cc.column_id
        left join sys.default_constraints dc on c.default_object_id != 0 and c.object_id = dc.parent_object_id and c.column_id = dc.parent_column_id
        left join sys.identity_columns ic on c.is_identity = 1 and c.object_id = ic.object_id and c.column_id = ic.column_id
    order by
        ic.is_identity desc,
        c.name
`;

/**
 * Get SQL primary key information.
 */
export const primaryKeyRead: string = `
    select
        c.object_id,
        ic.is_descending_key,
        k.name,
        c.name as [column]
    from
        sys.index_columns ic
        join sys.columns c on c.object_id = ic.object_id and c.column_id = ic.column_id
        left join sys.key_constraints k on k.parent_object_id = ic.object_id
    where
        ic.is_included_column = 0
        and ic.index_id = k.unique_index_id
        and k.type = 'PK'
`;

/**
 * Get SQL foreign key information.
 */
export const foreignKeyRead: string = `
    select
        ro.object_id,
        k.constraint_object_id,
        fk.is_not_trusted,
        c.name as [column],
        rc.name as [reference],
        fk.name,
        schema_name(ro.schema_id) as [schema],
        ro.name as [table],
        fk.delete_referential_action,
        fk.update_referential_action
    from
        sys.foreign_key_columns k
        join sys.columns rc on rc.object_id = k.referenced_object_id and rc.column_id = k.referenced_column_id
        join sys.columns c on c.object_id = k.parent_object_id and c.column_id = k.parent_column_id
        join sys.foreign_keys fk on fk.object_id = k.constraint_object_id
        join sys.objects ro on ro.object_id = fk.referenced_object_id
`;

/**
 * Get SQL index information.
 */
export const indexRead: string = `
    select
        ic.object_id,
        ic.index_id,
        ic.is_descending_key,
        ic.is_included_column,
        i.is_unique,
        i.name,
        c.name as [column],
        schema_name(ro.schema_id) as [schema],
        ro.name as [table]
    from
        sys.index_columns ic
        join sys.columns c on ic.object_id = c.object_id and ic.column_id = c.column_id
        join sys.indexes i on i.object_id = c.object_id and i.index_id = ic.index_id and i.is_primary_key = 0 and i.type = 2
        inner join sys.objects ro on ro.object_id = c.object_id
    where
        ro.is_ms_shipped = 0
        and ic.is_included_column = 0
    order by
        ro.schema_id,
        ro.name,
        c.object_id
`;

/**
 * Get SQL information for procs, triggers, functions, etc.
 */
export const objectRead: string = `
    select
        so.name
        ,s.name as [schema]
        ,so.type as [type]
        ,stuff
        (
            (
                select
                    cast(sc_inner.text as varchar(max))
                from
                    sys.objects so_inner
                    inner join syscomments sc_inner on sc_inner.id = so_inner.object_id
                    inner join sys.schemas s_inner on s_inner.schema_id = so_inner.schema_id
                where
                    so_inner.name = so.name
                    and s_inner.name = s.name
                for xml path(''), type
            ).value('(./text())[1]', 'varchar(max)')
            ,1
            ,0
            ,''
        ) as [text]
    from
        sys.objects so
        inner join syscomments sc on sc.id = so.object_id and so.type in ('P', 'V', 'TF', 'FN', 'TR')
        inner join sys.schemas s on s.schema_id = so.schema_id
    group by
        so.name
        ,s.name
        ,so.type
`;

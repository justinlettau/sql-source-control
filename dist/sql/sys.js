"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Get SQL table information.
 */
exports.tableRead = "\n    select\n        o.object_id,\n        o.type,\n        s.name as [schema],\n        o.name\n    from\n        sys.objects o\n        join sys.schemas s on o.schema_id = s.schema_id\n    where\n        o.type = 'U'\n        and o.is_ms_shipped = 0\n    order by\n        s.name,\n        o.name\n";
/**
 * Get SQL column information.
 */
exports.columnRead = "\n    select\n        c.object_id,\n        c.name,\n        tp.name as [datatype],\n        c.max_length,\n        c.is_computed,\n        c.precision,\n        c.scale as scale,\n        c.collation_name,\n        c.is_nullable,\n        dc.definition,\n        ic.is_identity,\n        ic.seed_value,\n        ic.increment_value\n    from\n        sys.columns c\n        join sys.types tp on c.user_type_id = tp.user_type_id\n        left join sys.computed_columns cc on c.object_id = cc.object_id and c.column_id = cc.column_id\n        left join sys.default_constraints dc on\n            c.default_object_id != 0\n            and c.object_id = dc.parent_object_id\n            and c.column_id = dc.parent_column_id\n        left join sys.identity_columns ic on c.is_identity = 1 and c.object_id = ic.object_id and c.column_id = ic.column_id\n    order by\n        ic.is_identity desc,\n        c.name\n";
/**
 * Get SQL primary key information.
 */
exports.primaryKeyRead = "\n    select\n        c.object_id,\n        ic.is_descending_key,\n        k.name,\n        c.name as [column]\n    from\n        sys.index_columns ic\n        join sys.columns c on c.object_id = ic.object_id and c.column_id = ic.column_id\n        left join sys.key_constraints k on k.parent_object_id = ic.object_id\n    where\n        ic.is_included_column = 0\n        and ic.index_id = k.unique_index_id\n        and k.type = 'PK'\n    order by c.object_id,\n        ic.is_descending_key,\n        k.name,\n        [column]\n";
/**
 * Get SQL foreign key information.
 */
exports.foreignKeyRead = "\n    select\n        ro.object_id,\n        k.constraint_object_id,\n        fk.is_not_trusted,\n        c.name as [column],\n        rc.name as [reference],\n        fk.name,\n        schema_name(ro.schema_id) as [schema],\n        ro.name as [table],\n        fk.delete_referential_action,\n        fk.update_referential_action\n    from\n        sys.foreign_key_columns k\n        join sys.columns rc on rc.object_id = k.referenced_object_id and rc.column_id = k.referenced_column_id\n        join sys.columns c on c.object_id = k.parent_object_id and c.column_id = k.parent_column_id\n        join sys.foreign_keys fk on fk.object_id = k.constraint_object_id\n        join sys.objects ro on ro.object_id = fk.referenced_object_id\n    order by ro.object_id,\n        k.constraint_object_id,\n        fk.is_not_trusted,\n        [column],\n        [reference]\n";
/**
 * Get SQL index information.
 */
exports.indexRead = "\n    select\n        ic.object_id,\n        ic.index_id,\n        ic.is_descending_key,\n        ic.is_included_column,\n        i.is_unique,\n        i.name,\n        c.name as [column],\n        schema_name(ro.schema_id) as [schema],\n        ro.name as [table]\n    from\n        sys.index_columns ic\n        join sys.columns c on ic.object_id = c.object_id and ic.column_id = c.column_id\n        join sys.indexes i on i.object_id = c.object_id and i.index_id = ic.index_id and i.is_primary_key = 0 and i.type = 2\n        inner join sys.objects ro on ro.object_id = c.object_id\n    where\n        ro.is_ms_shipped = 0\n        and ic.is_included_column = 0\n    order by\n        ro.schema_id,\n        ro.name,\n        c.object_id\n";
/**
 * Get SQL information for procs, triggers, functions, etc.
 */
exports.objectRead = "\n    select\n        so.name,\n        s.name as [schema],\n        so.type as [type],\n        stuff\n        (\n            (\n                select\n                    cast(sc_inner.text as varchar(max))\n                from\n                    sys.objects so_inner\n                    inner join syscomments sc_inner on sc_inner.id = so_inner.object_id\n                    inner join sys.schemas s_inner on s_inner.schema_id = so_inner.schema_id\n                where\n                    so_inner.name = so.name\n                    and s_inner.name = s.name\n                for xml path(''), type\n            ).value('(./text())[1]', 'varchar(max)')\n            ,1\n            ,0\n            ,''\n        ) as [text]\n    from\n        sys.objects so\n        inner join syscomments sc on sc.id = so.object_id and so.type in ('P', 'V', 'TF', 'FN', 'TR')\n        inner join sys.schemas s on s.schema_id = so.schema_id\n    group by\n        so.name\n        ,s.name\n        ,so.type\n";
//# sourceMappingURL=sys.js.map
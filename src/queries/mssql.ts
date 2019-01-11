/**
 * Get SQL table information.
 */
export const tablesRead = `
  SELECT
    o.object_id,
    o.type,
    s.name AS [schema],
    o.name,
    isnull(c.identity_count, 0) AS [identity_count]
  FROM
    sys.objects o
    JOIN sys.schemas s ON o.schema_id = s.schema_id
    LEFT JOIN (
      SELECT
        i.object_id,
        count(1) AS [identity_count]
      FROM
        sys.identity_columns i
      GROUP BY
        i.object_id
    ) c on c.object_id = o.object_id
  where
    o.type = 'U'
    AND o.is_ms_shipped = 0
  ORDER BY
    s.name,
    o.name
`;

/**
 * Get SQL column information.
 */
export const columnsRead = `
  SELECT
    c.object_id,
    c.name,
    tp.name AS [datatype],
    c.max_length,
    c.is_computed,
    c.precision,
    c.scale AS [scale],
    c.collation_name,
    c.is_nullable,
    dc.definition,
    ic.is_identity,
    ic.seed_value,
    ic.increment_value,
    cc.definition AS [formula]
  FROM
    sys.columns c
    JOIN sys.types tp ON c.user_type_id = tp.user_type_id
    LEFT JOIN sys.computed_columns cc ON c.object_id = cc.object_id AND c.column_id = cc.column_id
    LEFT JOIN sys.default_constraints dc ON
      c.default_object_id != 0
      AND c.object_id = dc.parent_object_id
      AND c.column_id = dc.parent_column_id
    LEFT JOIN sys.identity_columns ic ON
      c.is_identity = 1
      AND c.object_id = ic.object_id
      AND c.column_id = ic.column_id
`;

/**
 * Get SQL primary key information.
 */
export const primaryKeysRead = `
  SELECT
    c.object_id,
    ic.is_descending_key,
    k.name,
    c.name AS [column]
  FROM
    sys.index_columns ic
    JOIN sys.columns c ON c.object_id = ic.object_id AND c.column_id = ic.column_id
    LEFT JOIN sys.key_constraints k ON k.parent_object_id = ic.object_id
  WHERE
    ic.is_included_column = 0
    AND ic.index_id = k.unique_index_id
    AND k.type = 'PK'
`;

/**
 * Get SQL foreign key information.
 */
export const foreignKeysRead = `
  SELECT
    po.object_id,
    k.constraint_object_id,
    fk.is_not_trusted,
    c.name AS [column],
    rc.name AS [reference],
    fk.name,
    SCHEMA_NAME(ro.schema_id) AS [schema],
    po.name AS [table],
    SCHEMA_NAME(ro.schema_id) AS [parent_schema],
    ro.name AS [parent_table],
    fk.delete_referential_action,
    fk.update_referential_action
  FROM
    sys.foreign_key_columns k
    JOIN sys.columns rc ON rc.object_id = k.referenced_object_id AND rc.column_id = k.referenced_column_id
    JOIN sys.columns c ON c.object_id = k.parent_object_id AND c.column_id = k.parent_column_id
    JOIN sys.foreign_keys fk ON fk.object_id = k.constraint_object_id
    JOIN sys.objects ro ON ro.object_id = fk.referenced_object_id
    JOIN sys.objects po ON po.object_id = fk.parent_object_id
`;

/**
 * Get SQL index information.
 */
export const indexesRead = `
  SELECT
    ic.object_id,
    ic.index_id,
    ic.is_descending_key,
    ic.is_included_column,
    i.is_unique,
    i.name,
    c.name AS [column],
    SCHEMA_NAME(ro.schema_id) AS [schema],
    ro.name AS [table]
  FROM
    sys.index_columns ic
    JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
    JOIN sys.indexes i ON i.object_id = c.object_id AND i.index_id = ic.index_id AND i.is_primary_key = 0 AND i.type = 2
    INNER JOIN sys.objects ro ON ro.object_id = c.object_id
  where
    ro.is_ms_shipped = 0
    AND ic.is_included_column = 0
  ORDER BY
    ro.schema_id,
    ro.name,
    c.object_id
`;

/**
 * Get SQL information for user defined types.
 */
export const typesRead = `
  SELECT
    o.object_id,
    o.type,
    s.name AS [schema],
    t.name
  FROM
    sys.table_types t
    INNER JOIN sys.objects o ON o.object_id = t.type_table_object_id
    JOIN sys.schemas s ON t.schema_id = s.schema_id
  where
    o.type = 'TT'
    AND t.is_user_defined = 1
  ORDER BY
    s.name,
    o.name
`;

/**
 * Get SQL information for procs, triggers, functions, etc.
 */
export const objectsRead = `
  SELECT
    so.name,
    s.name AS [schema],
    so.type AS [type],
    STUFF
    (
      (
        SELECT
          CAST(sc_inner.text AS varchar(max))
        FROM
          sys.objects so_inner
          INNER JOIN syscomments sc_inner ON sc_inner.id = so_inner.object_id
          INNER JOIN sys.schemas s_inner ON s_inner.schema_id = so_inner.schema_id
        WHERE
          so_inner.name = so.name
          AND s_inner.name = s.name
        FOR XML PATH(''), TYPE
      ).value('(./text())[1]', 'varchar(max)')
      ,1
      ,0
      ,''
    ) AS [text]
  FROM
    sys.objects so
    INNER JOIN syscomments sc ON sc.id = so.object_id AND so.type in ('P', 'V', 'TF', 'IF', 'FN', 'TR')
    INNER JOIN sys.schemas s ON s.schema_id = so.schema_id
  GROUP BY
    so.name
    ,s.name
    ,so.type
`;

/**
 * Get SQL table information.
 */
export const tableRead: string = `
select
    o.object_id,
    o.type,
    s.name as [schema],
    o.name,
	f.name as [filegroup],
	case when t.lock_escalation_desc = 'DISABLE' then 0 else 1 end as [lock_escalation]
  from
    sys.objects o
    inner join sys.schemas s on o.schema_id = s.schema_id
	inner join sys.indexes i on i.object_id = o.object_id
	inner join sys.filegroups f on f.data_space_id = i.data_space_id
	inner join sys.tables t on t.object_id = o.object_id
  where
    o.type = 'U'
    and o.is_ms_shipped = 0 and not exists (
    select ep.[major_id]
    from [sys].[extended_properties] ep
    where ep.[major_id] = o.[object_id]
    and ep.[minor_id] = 0
    and ep.[class] = 1
    and ep.[name] = N'microsoft_database_tools_support')
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
    ic.increment_value,
	cc.definition as [computed_definition],
    cc.is_persisted
  from
    sys.columns c
    join sys.types tp on c.user_type_id = tp.user_type_id
    left join sys.computed_columns cc on c.object_id = cc.object_id and c.column_id = cc.column_id
    left join sys.default_constraints dc on
      c.default_object_id != 0
      and c.object_id = dc.parent_object_id
      and c.column_id = dc.parent_column_id
    left join sys.identity_columns ic on c.is_identity = 1 and c.object_id = ic.object_id and c.column_id = ic.column_id
  order by
    c.column_id
`;

/**
 * Get SQL primary key information.
 */
export const primaryKeyRead: string = `
  select
    c.object_id,
    ic.is_descending_key,
    i.name,
    c.name as [column],
	i.type_desc as [indextype],
	f.name as [filegroup],
	case when i.allow_page_locks = 1 then 'ON' else 'OFF' end as [allow_page_locks],
	case when i.allow_row_locks = 1 then 'ON' else 'OFF' end as [allow_row_locks],
	case when i.ignore_dup_key = 1 then 'ON' else 'OFF' end as [ignore_dup_key],
	case when i.is_padded = 1 then 'ON' else 'OFF' end as [is_padded],
	ic.key_ordinal
from sys.indexes i
    inner join sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
    inner join sys.columns c ON ic.object_id = c.object_id and ic.column_id = c.column_id
    inner join sys.objects o ON i.object_id = o.object_id
    inner join sys.schemas sc ON o.schema_id = sc.schema_id
	inner join sys.filegroups f on f.data_space_id = i.data_space_id
where i.is_primary_key = 1
order by o.name, i.name, ic.key_ordinal
`;

/**
 * Get SQL foreign key information.
 */
export const foreignKeyRead: string = `
select
  fk.object_id,
  fk.parent_object_id,
  case when fk.is_not_trusted = 1 then 'NOCHECK' else 'CHECK' end as [check_constraint],
  cs.name as [constraint_schema],
  ct.name as [constraint_table],
  fk.name,
  STUFF((SELECT ',' + QUOTENAME(c.name)
   -- get all the columns in the constraint table
    FROM sys.columns AS c 
    INNER JOIN sys.foreign_key_columns AS fkc 
    ON fkc.parent_column_id = c.column_id
    AND fkc.parent_object_id = c.[object_id]
    WHERE fkc.constraint_object_id = fk.[object_id]
    ORDER BY fkc.constraint_column_id 
    FOR XML PATH(N''), TYPE).value(N'.[1]', N'nvarchar(max)'), 1, 1, N'') as [constraint_columns],
  rs.name as [ref_schema],
  rt.name as [ref_table],
  STUFF((SELECT ',' + QUOTENAME(c.name)
   -- get all the referenced columns
    FROM sys.columns AS c 
    INNER JOIN sys.foreign_key_columns AS fkc 
    ON fkc.referenced_column_id = c.column_id
    AND fkc.referenced_object_id = c.[object_id]
    WHERE fkc.constraint_object_id = fk.[object_id]
    ORDER BY fkc.constraint_column_id 
    FOR XML PATH(N''), TYPE).value(N'.[1]', N'nvarchar(max)'), 1, 1, N'') as [ref_columns],
  case 
	when fk.delete_referential_action = 1 then 'ON DELETE CASCADE'
	when fk.delete_referential_action = 2 then 'ON DELETE SET NULL'
	when fk.delete_referential_action = 3 then 'ON DELETE SET DEFAULT'
	when fk.delete_referential_action = 0 then ''
  end as [delete_referential_action],
  case 
	when fk.update_referential_action = 1 then 'ON UPDATE CASCADE'
	when fk.update_referential_action = 2 then 'ON UPDATE SET NULL'
	when fk.update_referential_action = 3 then 'ON UPDATE SET DEFAULT'
	when fk.update_referential_action = 0 then ''
  end	as [update_referential_action],
  fk.is_not_for_replication,
  fk.is_disabled
from sys.foreign_keys fk
inner join sys.tables rt -- referenced table
  on fk.referenced_object_id = rt.[object_id]
inner join sys.schemas rs 
  on rt.[schema_id] = rs.[schema_id]
inner join sys.tables ct -- constraint table
  on fk.parent_object_id = ct.[object_id]
inner join sys.schemas cs 
  on ct.[schema_id] = cs.[schema_id]
where rt.is_ms_shipped = 0 and ct.is_ms_shipped = 0
order by cs.name, ct.name;
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
    stuff((select ', ' + QUOTENAME(c.name)
	    from sys.index_columns iic
		inner join sys.columns c on c.object_id = iic.object_id and c.column_id = iic.column_id
		where i.object_id = iic.object_id and i.index_id = iic.index_id and iic.is_included_column = 0
		order by ic.key_ordinal
	FOR XML PATH(N''), TYPE).value(N'.[1]', N'nvarchar(max)'), 1, 1, N'') as [columns],
    schema_name(ro.schema_id) as [schema],
    ro.name as [table],
	i.type_desc as [indextype],
	i.is_unique_constraint,
	stuff((select ', ' + QUOTENAME(c.name)
	    from sys.index_columns iic
		inner join sys.columns c on c.object_id = iic.object_id and c.column_id = iic.column_id
		where i.object_id = iic.object_id and i.index_id = iic.index_id and iic.is_included_column = 1
		order by c.name
	FOR XML PATH(N''), TYPE).value(N'.[1]', N'nvarchar(max)'), 1, 1, N'') as [included_columns]
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
 * Get SQL information for table-valued parameters.
 */
export const tvpRead: string = `
  select
    o.object_id,
    o.type,
    s.name as [schema],
    t.name
  from sys.table_types t
    inner join sys.objects o on o.object_id = t.type_table_object_id
    join sys.schemas s on t.schema_id = s.schema_id
  where
    o.type = 'TT'
    and t.is_user_defined = 1
  order by
    s.name,
    o.name
`;

/**
 * Get SQL information for procs, triggers, functions, etc.
 */
export const objectRead: string = `
  select
    so.name,
    s.name as [schema],
    so.type as [type],
    stuff
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
    inner join syscomments sc on sc.id = so.object_id and so.type in ('P', 'V', 'TF', 'IF', 'FN', 'TR')
    inner join sys.schemas s on s.schema_id = so.schema_id
  where so.is_ms_shipped = 0 and not exists (
    select ep.[major_id]
    from [sys].[extended_properties] ep
    where ep.[major_id] = so.[object_id]
    and ep.[minor_id] = 0
    and ep.[class] = 1
    and ep.[name] = N'microsoft_database_tools_support')
  group by
    so.name
    ,s.name
    ,so.type
`;

export const fullTextCatalogRead: string = `
  select 
  	ftc.name,
  	case when ftc.is_accent_sensitivity_on = 1 then 'ON' else 'OFF' end as [accent_sensitivity]
  from sys.fulltext_catalogs ftc
`;

export const fullTextStopListRead: string = `
  select
    sl.stoplist_id,
    sl.name
  from sys.fulltext_stoplists sl
`;

export const fullTextStopWordsRead: string = `
  select
	sl.stoplist_id,
	sl.name,
	sw.stopword,
	sw.language
  from sys.fulltext_stopwords sw
	inner join sys.fulltext_stoplists sl on sw.stoplist_id = sl.stoplist_id
`;

export const defaultConstraintsRead: string = `
  select 
  	  s.name as [schema],
      t.name as [table_name],
      c.name as [column_name],
      dc.name as [constraint_name],
      dc.definition
  from sys.tables t
  inner join sys.schemas s on t.schema_id = s.schema_id
  inner join sys.default_constraints dc ON t.object_id = dc.parent_object_id
  inner join sys.columns c ON dc.parent_object_id = c.object_id AND c.column_id = dc.parent_column_id
  order by table_name
`;

export const synonymsRead: string = `
  select 
    s.name as [schema],
    sy.name,
    replace(sy.base_object_name, left(sy.base_object_name, charindex('.', sy.base_object_name) - 1), '') as [reference]
  from sys.synonyms sy
   inner join sys.schemas s on sy.schema_id = s.schema_id
`;

export const fullTextIndexRead: string = `
DECLARE @Catalog NVARCHAR(128),
		@SQL NVARCHAR(MAX),
		@COLS NVARCHAR(4000),
		@Owner NVARCHAR(128),
		@Table NVARCHAR(128),
		@ObjectID INT,
		@AccentOn BIT,
		@CatalogID INT,
		@IndexID INT,
		@Max_objectId INT,
		@NL CHAR(2),
		@i int

CREATE TABLE #Results ( 
  scheme [nvarchar](max) not null,
  table_name [nvarchar](max) not null,
  sql_value [nvarchar](max) not null
);

SET @i = 1;

-- Cursor to fetch the name of catalogs one by one for the current database

declare FTCur cursor for SELECT name
FROM sys.fulltext_catalogs
	ORDER BY name

OPEN FTCur
 

FETCH FTCur INTO @Catalog

WHILE @@FETCH_status >= 0

BEGIN

SELECT
	@NL = CHAR(13) + CHAR(10) --Carriage Return

-- Check catalog exists
IF EXISTS
(
	SELECT name
	FROM sys.fulltext_catalogs
	WHERE name = @Catalog
) BEGIN
		-- Store the catalog details
		SELECT
			@CatalogID = i.fulltext_catalog_id
			,@ObjectID = 0
			,@Max_objectId = MAX(object_id)
			,@AccentOn = is_accent_sensitivity_on
		FROM sys.fulltext_index_catalog_usages AS i
		JOIN sys.fulltext_catalogs c
			ON i.fulltext_catalog_id = c.fulltext_catalog_id
		WHERE c.name = @Catalog
		GROUP BY	i.fulltext_catalog_id
					,is_accent_sensitivity_on


		DECLARE FTObject CURSOR FOR SELECT	MIN(i.object_id) objectId
									,u.name AS schemaName
									,t.name
									,unique_index_id
									,c.name as catalogueName
		FROM sys.tables AS t
		JOIN sys.schemas AS u
			ON u.schema_id = t.schema_id
		JOIN sys.fulltext_indexes i
			ON t.object_id = i.object_id
		JOIN sys.fulltext_catalogs c
			ON i.fulltext_catalog_id = c.fulltext_catalog_id
		WHERE 1 = 1 
		AND c.name = @Catalog
		--AND i.object_id > @ObjectID
		GROUP BY	u.name
					,t.name
					,unique_index_id
					,c.name

		OPEN FTObject

		FETCH FTObject INTO @ObjectID, @Owner, @Table, @IndexID, @Catalog
		-- Loop through all fulltext indexes within catalog

				WHILE @@FETCH_status >= 0 
				BEGIN
		
					-- Script Fulltext Index
					SELECT
						@COLS = NULL
						,@SQL = 'CREATE FULLTEXT INDEX ON ' + QUOTENAME(@Owner) + '.' + QUOTENAME(@Table) + ' (' + @NL
						PRINT @NL
					-- Script columns in index
					SELECT
						@COLS = COALESCE(@COLS + ',', '') + c.Name + ' Language ' + CAST(language_id AS varchar) + ' ' + @NL
					FROM sys.fulltext_index_columns AS fi
					JOIN sys.columns AS c
						ON c.object_id = fi.object_id
						AND c.column_id = fi.column_id
					WHERE fi.object_id = @ObjectID

					-- Script unique key index
					SELECT
						@SQL = @SQL + @COLS + ') ' + @NL + 'KEY INDEX ' + i.name + @NL +
						'ON ' + @Catalog + @NL +
						'WITH CHANGE_TRACKING ' + fi.change_tracking_state_desc +
						case when fi.stoplist_id is null then ', STOPLIST OFF' else '' end
					FROM sys.indexes AS i
					JOIN sys.fulltext_indexes AS fi
						ON i.object_id = fi.object_id
					WHERE i.object_id = @ObjectID
					AND index_id = @IndexID

					SELECT 
						@SQL = @SQL + ', STOPLIST = ' + st.name
					FROM sys.indexes as i
					join sys.fulltext_indexes as fi on i.object_id = fi.object_id
					join sys.fulltext_stoplists as st on st.stoplist_id = fi.stoplist_id
					WHERE i.object_id = @ObjectID
					and index_id = @IndexID

					-- Output script SQL
				insert into #Results (scheme, table_name, sql_value) select @Owner, @Table, @SQL;

					FETCH FTObject INTO @ObjectID, @Owner, @Table, @IndexID,@Catalog
				END
		CLOSE FTObject;
		DEALLOCATE FTObject;
FETCH FTCur INTO @Catalog
END
END

select * from #Results;

DROP TABLE #Results;


CLOSE FTCur
DEALLOCATE FTCur
`;

IF NOT EXISTS (
    SELECT 1 FROM sys.types AS t
    JOIN sys.schemas s ON t.schema_id = s.schema_id
    WHERE t.name = 'Name' AND s.name = 'dbo'
)
CREATE TYPE [dbo].[Name]
FROM NVARCHAR(100) NULL
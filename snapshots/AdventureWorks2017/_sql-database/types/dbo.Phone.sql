IF NOT EXISTS (
    SELECT 1 FROM sys.types AS t
    JOIN sys.schemas s ON t.schema_id = s.schema_id
    WHERE t.name = 'Phone' AND s.name = 'dbo'
)
CREATE TYPE [dbo].[Phone]
FROM NVARCHAR(50) NULL
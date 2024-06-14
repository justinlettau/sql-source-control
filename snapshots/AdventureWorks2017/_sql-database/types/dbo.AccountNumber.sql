IF NOT EXISTS (
    SELECT 1 FROM sys.types AS t
    JOIN sys.schemas s ON t.schema_id = s.schema_id
    WHERE t.name = 'AccountNumber' AND s.name = 'dbo'
)
CREATE TYPE [dbo].[AccountNumber]
FROM NVARCHAR(30) NULL
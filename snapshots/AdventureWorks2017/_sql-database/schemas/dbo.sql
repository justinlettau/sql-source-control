IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'dbo')
EXEC('CREATE SCHEMA dbo')
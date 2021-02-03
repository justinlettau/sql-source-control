IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'Person')
EXEC('CREATE SCHEMA Person')
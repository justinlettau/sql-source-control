IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'Production')
EXEC('CREATE SCHEMA Production')
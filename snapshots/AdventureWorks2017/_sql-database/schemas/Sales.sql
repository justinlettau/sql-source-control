IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'Sales')
EXEC('CREATE SCHEMA Sales')
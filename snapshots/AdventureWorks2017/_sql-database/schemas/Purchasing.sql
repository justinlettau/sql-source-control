IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'Purchasing')
EXEC('CREATE SCHEMA Purchasing')
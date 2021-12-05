IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'HumanResources')
EXEC('CREATE SCHEMA HumanResources')
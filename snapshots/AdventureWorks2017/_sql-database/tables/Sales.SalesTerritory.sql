IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Sales].[SalesTerritory]') AND type = 'U')
CREATE TABLE [Sales].[SalesTerritory]
(
    [TerritoryID] int NOT NULL IDENTITY(1, 1),
    [Name] Name NOT NULL,
    [CountryRegionCode] nvarchar(3) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [Group] nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [SalesYTD] money NOT NULL DEFAULT((0.00)),
    [SalesLastYear] money NOT NULL DEFAULT((0.00)),
    [CostYTD] money NOT NULL DEFAULT((0.00)),
    [CostLastYear] money NOT NULL DEFAULT((0.00)),
    [rowguid] uniqueidentifier NOT NULL DEFAULT(newid()),
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_SalesTerritory_TerritoryID] PRIMARY KEY CLUSTERED ([TerritoryID] ASC)
)

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Sales].[FK_SalesTerritory_CountryRegion_CountryRegionCode]') AND parent_object_id = OBJECT_ID('[Sales].[SalesTerritory]'))
BEGIN
    ALTER TABLE [Sales].[SalesTerritory] WITH CHECK ADD CONSTRAINT [FK_SalesTerritory_CountryRegion_CountryRegionCode] FOREIGN KEY ([CountryRegionCode]) REFERENCES [Person].[CountryRegion] ([CountryRegionCode])
    ALTER TABLE [Sales].[SalesTerritory] CHECK CONSTRAINT [FK_SalesTerritory_CountryRegion_CountryRegionCode]
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Sales].[SalesTerritory]') AND name = 'AK_SalesTerritory_Name')
CREATE UNIQUE NONCLUSTERED INDEX [AK_SalesTerritory_Name] ON [Sales].[SalesTerritory]([Name] ASC)

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Sales].[SalesTerritory]') AND name = 'AK_SalesTerritory_rowguid')
CREATE UNIQUE NONCLUSTERED INDEX [AK_SalesTerritory_rowguid] ON [Sales].[SalesTerritory]([rowguid] ASC)
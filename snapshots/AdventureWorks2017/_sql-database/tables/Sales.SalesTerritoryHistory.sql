IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Sales].[SalesTerritoryHistory]') AND type = 'U')
CREATE TABLE [Sales].[SalesTerritoryHistory]
(
    [BusinessEntityID] int NOT NULL,
    [TerritoryID] int NOT NULL,
    [StartDate] datetime NOT NULL,
    [EndDate] datetime NULL,
    [rowguid] uniqueidentifier NOT NULL DEFAULT(newid()),
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_SalesTerritoryHistory_BusinessEntityID_StartDate_TerritoryID] PRIMARY KEY CLUSTERED 
    (
        [BusinessEntityID] ASC,
        [StartDate] ASC,
        [TerritoryID] ASC
    )
)

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Sales].[FK_SalesTerritoryHistory_SalesPerson_BusinessEntityID]') AND parent_object_id = OBJECT_ID('[Sales].[SalesTerritoryHistory]'))
BEGIN
    ALTER TABLE [Sales].[SalesTerritoryHistory] WITH CHECK ADD CONSTRAINT [FK_SalesTerritoryHistory_SalesPerson_BusinessEntityID] FOREIGN KEY ([BusinessEntityID]) REFERENCES [Sales].[SalesPerson] ([BusinessEntityID])
    ALTER TABLE [Sales].[SalesTerritoryHistory] CHECK CONSTRAINT [FK_SalesTerritoryHistory_SalesPerson_BusinessEntityID]
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Sales].[FK_SalesTerritoryHistory_SalesTerritory_TerritoryID]') AND parent_object_id = OBJECT_ID('[Sales].[SalesTerritoryHistory]'))
BEGIN
    ALTER TABLE [Sales].[SalesTerritoryHistory] WITH CHECK ADD CONSTRAINT [FK_SalesTerritoryHistory_SalesTerritory_TerritoryID] FOREIGN KEY ([TerritoryID]) REFERENCES [Sales].[SalesTerritory] ([TerritoryID])
    ALTER TABLE [Sales].[SalesTerritoryHistory] CHECK CONSTRAINT [FK_SalesTerritoryHistory_SalesTerritory_TerritoryID]
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Sales].[SalesTerritoryHistory]') AND name = 'AK_SalesTerritoryHistory_rowguid')
CREATE UNIQUE NONCLUSTERED INDEX [AK_SalesTerritoryHistory_rowguid] ON [Sales].[SalesTerritoryHistory]([rowguid] ASC)
IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Sales].[Store]') AND type = 'U')
CREATE TABLE [Sales].[Store]
(
    [BusinessEntityID] int NOT NULL,
    [Name] Name NOT NULL,
    [SalesPersonID] int NULL,
    [Demographics] xml NULL,
    [rowguid] uniqueidentifier NOT NULL DEFAULT(newid()),
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_Store_BusinessEntityID] PRIMARY KEY CLUSTERED ([BusinessEntityID] ASC)
)

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Sales].[FK_Store_BusinessEntity_BusinessEntityID]') AND parent_object_id = OBJECT_ID('[Sales].[Store]'))
BEGIN
    ALTER TABLE [Sales].[Store] WITH CHECK ADD CONSTRAINT [FK_Store_BusinessEntity_BusinessEntityID] FOREIGN KEY ([BusinessEntityID]) REFERENCES [Person].[BusinessEntity] ([BusinessEntityID])
    ALTER TABLE [Sales].[Store] CHECK CONSTRAINT [FK_Store_BusinessEntity_BusinessEntityID]
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Sales].[FK_Store_SalesPerson_SalesPersonID]') AND parent_object_id = OBJECT_ID('[Sales].[Store]'))
BEGIN
    ALTER TABLE [Sales].[Store] WITH CHECK ADD CONSTRAINT [FK_Store_SalesPerson_SalesPersonID] FOREIGN KEY ([SalesPersonID]) REFERENCES [Sales].[SalesPerson] ([BusinessEntityID])
    ALTER TABLE [Sales].[Store] CHECK CONSTRAINT [FK_Store_SalesPerson_SalesPersonID]
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Sales].[Store]') AND name = 'AK_Store_rowguid')
CREATE UNIQUE NONCLUSTERED INDEX [AK_Store_rowguid] ON [Sales].[Store]([rowguid] ASC)

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Sales].[Store]') AND name = 'IX_Store_SalesPersonID')
CREATE NONCLUSTERED INDEX [IX_Store_SalesPersonID] ON [Sales].[Store]([SalesPersonID] ASC)
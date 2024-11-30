IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Sales].[SalesPersonQuotaHistory]') AND type = 'U')
CREATE TABLE [Sales].[SalesPersonQuotaHistory]
(
    [BusinessEntityID] int NOT NULL,
    [QuotaDate] datetime NOT NULL,
    [SalesQuota] money NOT NULL,
    [rowguid] uniqueidentifier NOT NULL DEFAULT(newid()),
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_SalesPersonQuotaHistory_BusinessEntityID_QuotaDate] PRIMARY KEY CLUSTERED 
    (
        [BusinessEntityID] ASC,
        [QuotaDate] ASC
    )
)

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Sales].[FK_SalesPersonQuotaHistory_SalesPerson_BusinessEntityID]') AND parent_object_id = OBJECT_ID('[Sales].[SalesPersonQuotaHistory]'))
BEGIN
    ALTER TABLE [Sales].[SalesPersonQuotaHistory] WITH CHECK ADD CONSTRAINT [FK_SalesPersonQuotaHistory_SalesPerson_BusinessEntityID] FOREIGN KEY ([BusinessEntityID]) REFERENCES [Sales].[SalesPerson] ([BusinessEntityID])
    ALTER TABLE [Sales].[SalesPersonQuotaHistory] CHECK CONSTRAINT [FK_SalesPersonQuotaHistory_SalesPerson_BusinessEntityID]
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Sales].[SalesPersonQuotaHistory]') AND name = 'AK_SalesPersonQuotaHistory_rowguid')
CREATE UNIQUE NONCLUSTERED INDEX [AK_SalesPersonQuotaHistory_rowguid] ON [Sales].[SalesPersonQuotaHistory]([rowguid] ASC)
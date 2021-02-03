IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Sales].[SalesOrderDetail]') AND type = 'U')
CREATE TABLE [Sales].[SalesOrderDetail]
(
    [SalesOrderID] int NOT NULL,
    [SalesOrderDetailID] int NOT NULL IDENTITY(1, 1),
    [CarrierTrackingNumber] nvarchar(25) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
    [OrderQty] smallint NOT NULL,
    [ProductID] int NOT NULL,
    [SpecialOfferID] int NOT NULL,
    [UnitPrice] money NOT NULL,
    [UnitPriceDiscount] money NOT NULL DEFAULT((0.0)),
    [LineTotal] AS (isnull(([UnitPrice]*((1.0)-[UnitPriceDiscount]))*[OrderQty],(0.0))),
    [rowguid] uniqueidentifier NOT NULL DEFAULT(newid()),
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_SalesOrderDetail_SalesOrderID_SalesOrderDetailID] PRIMARY KEY CLUSTERED 
    (
        [SalesOrderID] ASC,
        [SalesOrderDetailID] ASC
    )
)

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Sales].[FK_SalesOrderDetail_SalesOrderHeader_SalesOrderID]') AND parent_object_id = OBJECT_ID('[Sales].[SalesOrderDetail]'))
BEGIN
    ALTER TABLE [Sales].[SalesOrderDetail] WITH CHECK ADD CONSTRAINT [FK_SalesOrderDetail_SalesOrderHeader_SalesOrderID] FOREIGN KEY ([SalesOrderID]) REFERENCES [Sales].[SalesOrderHeader] ([SalesOrderID]) ON DELETE CASCADE
    ALTER TABLE [Sales].[SalesOrderDetail] CHECK CONSTRAINT [FK_SalesOrderDetail_SalesOrderHeader_SalesOrderID]
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Sales].[FK_SalesOrderDetail_SpecialOfferProduct_SpecialOfferIDProductID]') AND parent_object_id = OBJECT_ID('[Sales].[SalesOrderDetail]'))
BEGIN
    ALTER TABLE [Sales].[SalesOrderDetail] WITH CHECK ADD CONSTRAINT [FK_SalesOrderDetail_SpecialOfferProduct_SpecialOfferIDProductID] FOREIGN KEY ([SpecialOfferID]) REFERENCES [Sales].[SpecialOfferProduct] ([SpecialOfferID])
    ALTER TABLE [Sales].[SalesOrderDetail] CHECK CONSTRAINT [FK_SalesOrderDetail_SpecialOfferProduct_SpecialOfferIDProductID]
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Sales].[FK_SalesOrderDetail_SpecialOfferProduct_SpecialOfferIDProductID]') AND parent_object_id = OBJECT_ID('[Sales].[SalesOrderDetail]'))
BEGIN
    ALTER TABLE [Sales].[SalesOrderDetail] WITH CHECK ADD CONSTRAINT [FK_SalesOrderDetail_SpecialOfferProduct_SpecialOfferIDProductID] FOREIGN KEY ([ProductID]) REFERENCES [Sales].[SpecialOfferProduct] ([ProductID])
    ALTER TABLE [Sales].[SalesOrderDetail] CHECK CONSTRAINT [FK_SalesOrderDetail_SpecialOfferProduct_SpecialOfferIDProductID]
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Sales].[SalesOrderDetail]') AND name = 'AK_SalesOrderDetail_rowguid')
CREATE UNIQUE NONCLUSTERED INDEX [AK_SalesOrderDetail_rowguid] ON [Sales].[SalesOrderDetail]([rowguid] ASC)

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Sales].[SalesOrderDetail]') AND name = 'IX_SalesOrderDetail_ProductID')
CREATE NONCLUSTERED INDEX [IX_SalesOrderDetail_ProductID] ON [Sales].[SalesOrderDetail]([ProductID] ASC)
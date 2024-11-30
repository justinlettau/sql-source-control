IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Sales].[SpecialOfferProduct]') AND type = 'U')
CREATE TABLE [Sales].[SpecialOfferProduct]
(
    [SpecialOfferID] int NOT NULL,
    [ProductID] int NOT NULL,
    [rowguid] uniqueidentifier NOT NULL DEFAULT(newid()),
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_SpecialOfferProduct_SpecialOfferID_ProductID] PRIMARY KEY CLUSTERED 
    (
        [SpecialOfferID] ASC,
        [ProductID] ASC
    )
)

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Sales].[FK_SpecialOfferProduct_Product_ProductID]') AND parent_object_id = OBJECT_ID('[Sales].[SpecialOfferProduct]'))
BEGIN
    ALTER TABLE [Sales].[SpecialOfferProduct] WITH CHECK ADD CONSTRAINT [FK_SpecialOfferProduct_Product_ProductID] FOREIGN KEY ([ProductID]) REFERENCES [Production].[Product] ([ProductID])
    ALTER TABLE [Sales].[SpecialOfferProduct] CHECK CONSTRAINT [FK_SpecialOfferProduct_Product_ProductID]
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Sales].[FK_SpecialOfferProduct_SpecialOffer_SpecialOfferID]') AND parent_object_id = OBJECT_ID('[Sales].[SpecialOfferProduct]'))
BEGIN
    ALTER TABLE [Sales].[SpecialOfferProduct] WITH CHECK ADD CONSTRAINT [FK_SpecialOfferProduct_SpecialOffer_SpecialOfferID] FOREIGN KEY ([SpecialOfferID]) REFERENCES [Sales].[SpecialOffer] ([SpecialOfferID])
    ALTER TABLE [Sales].[SpecialOfferProduct] CHECK CONSTRAINT [FK_SpecialOfferProduct_SpecialOffer_SpecialOfferID]
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Sales].[SpecialOfferProduct]') AND name = 'AK_SpecialOfferProduct_rowguid')
CREATE UNIQUE NONCLUSTERED INDEX [AK_SpecialOfferProduct_rowguid] ON [Sales].[SpecialOfferProduct]([rowguid] ASC)

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Sales].[SpecialOfferProduct]') AND name = 'IX_SpecialOfferProduct_ProductID')
CREATE NONCLUSTERED INDEX [IX_SpecialOfferProduct_ProductID] ON [Sales].[SpecialOfferProduct]([ProductID] ASC)
IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Production].[ProductInventory]') AND type = 'U')
CREATE TABLE [Production].[ProductInventory]
(
    [ProductID] int NOT NULL,
    [LocationID] smallint NOT NULL,
    [Shelf] nvarchar(10) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [Bin] tinyint NOT NULL,
    [Quantity] smallint NOT NULL DEFAULT((0)),
    [rowguid] uniqueidentifier NOT NULL DEFAULT(newid()),
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_ProductInventory_ProductID_LocationID] PRIMARY KEY CLUSTERED 
    (
        [ProductID] ASC,
        [LocationID] ASC
    )
)

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Production].[FK_ProductInventory_Location_LocationID]') AND parent_object_id = OBJECT_ID('[Production].[ProductInventory]'))
BEGIN
    ALTER TABLE [Production].[ProductInventory] WITH CHECK ADD CONSTRAINT [FK_ProductInventory_Location_LocationID] FOREIGN KEY ([LocationID]) REFERENCES [Production].[Location] ([LocationID])
    ALTER TABLE [Production].[ProductInventory] CHECK CONSTRAINT [FK_ProductInventory_Location_LocationID]
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Production].[FK_ProductInventory_Product_ProductID]') AND parent_object_id = OBJECT_ID('[Production].[ProductInventory]'))
BEGIN
    ALTER TABLE [Production].[ProductInventory] WITH CHECK ADD CONSTRAINT [FK_ProductInventory_Product_ProductID] FOREIGN KEY ([ProductID]) REFERENCES [Production].[Product] ([ProductID])
    ALTER TABLE [Production].[ProductInventory] CHECK CONSTRAINT [FK_ProductInventory_Product_ProductID]
END
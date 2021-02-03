IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Sales].[ShoppingCartItem]') AND type = 'U')
CREATE TABLE [Sales].[ShoppingCartItem]
(
    [ShoppingCartItemID] int NOT NULL IDENTITY(1, 1),
    [ShoppingCartID] nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [Quantity] int NOT NULL DEFAULT((1)),
    [ProductID] int NOT NULL,
    [DateCreated] datetime NOT NULL DEFAULT(getdate()),
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_ShoppingCartItem_ShoppingCartItemID] PRIMARY KEY CLUSTERED ([ShoppingCartItemID] ASC)
)

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Sales].[FK_ShoppingCartItem_Product_ProductID]') AND parent_object_id = OBJECT_ID('[Sales].[ShoppingCartItem]'))
BEGIN
    ALTER TABLE [Sales].[ShoppingCartItem] WITH CHECK ADD CONSTRAINT [FK_ShoppingCartItem_Product_ProductID] FOREIGN KEY ([ProductID]) REFERENCES [Production].[Product] ([ProductID])
    ALTER TABLE [Sales].[ShoppingCartItem] CHECK CONSTRAINT [FK_ShoppingCartItem_Product_ProductID]
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Sales].[ShoppingCartItem]') AND name = 'IX_ShoppingCartItem_ShoppingCartID_ProductID')
CREATE NONCLUSTERED INDEX [IX_ShoppingCartItem_ShoppingCartID_ProductID] ON [Sales].[ShoppingCartItem](
    [ShoppingCartID] ASC,
    [ProductID] ASC
)
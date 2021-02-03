IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Production].[ProductListPriceHistory]') AND type = 'U')
CREATE TABLE [Production].[ProductListPriceHistory]
(
    [ProductID] int NOT NULL,
    [StartDate] datetime NOT NULL,
    [EndDate] datetime NULL,
    [ListPrice] money NOT NULL,
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_ProductListPriceHistory_ProductID_StartDate] PRIMARY KEY CLUSTERED 
    (
        [ProductID] ASC,
        [StartDate] ASC
    )
)

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Production].[FK_ProductListPriceHistory_Product_ProductID]') AND parent_object_id = OBJECT_ID('[Production].[ProductListPriceHistory]'))
BEGIN
    ALTER TABLE [Production].[ProductListPriceHistory] WITH CHECK ADD CONSTRAINT [FK_ProductListPriceHistory_Product_ProductID] FOREIGN KEY ([ProductID]) REFERENCES [Production].[Product] ([ProductID])
    ALTER TABLE [Production].[ProductListPriceHistory] CHECK CONSTRAINT [FK_ProductListPriceHistory_Product_ProductID]
END
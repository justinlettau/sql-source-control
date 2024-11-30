IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Production].[ProductCostHistory]') AND type = 'U')
CREATE TABLE [Production].[ProductCostHistory]
(
    [ProductID] int NOT NULL,
    [StartDate] datetime NOT NULL,
    [EndDate] datetime NULL,
    [StandardCost] money NOT NULL,
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_ProductCostHistory_ProductID_StartDate] PRIMARY KEY CLUSTERED 
    (
        [ProductID] ASC,
        [StartDate] ASC
    )
)

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Production].[FK_ProductCostHistory_Product_ProductID]') AND parent_object_id = OBJECT_ID('[Production].[ProductCostHistory]'))
BEGIN
    ALTER TABLE [Production].[ProductCostHistory] WITH CHECK ADD CONSTRAINT [FK_ProductCostHistory_Product_ProductID] FOREIGN KEY ([ProductID]) REFERENCES [Production].[Product] ([ProductID])
    ALTER TABLE [Production].[ProductCostHistory] CHECK CONSTRAINT [FK_ProductCostHistory_Product_ProductID]
END
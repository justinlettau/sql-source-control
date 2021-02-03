IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Production].[ProductDocument]') AND type = 'U')
CREATE TABLE [Production].[ProductDocument]
(
    [ProductID] int NOT NULL,
    [DocumentNode] hierarchyid NOT NULL,
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_ProductDocument_ProductID_DocumentNode] PRIMARY KEY CLUSTERED 
    (
        [ProductID] ASC,
        [DocumentNode] ASC
    )
)

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Production].[FK_ProductDocument_Product_ProductID]') AND parent_object_id = OBJECT_ID('[Production].[ProductDocument]'))
BEGIN
    ALTER TABLE [Production].[ProductDocument] WITH CHECK ADD CONSTRAINT [FK_ProductDocument_Product_ProductID] FOREIGN KEY ([ProductID]) REFERENCES [Production].[Product] ([ProductID])
    ALTER TABLE [Production].[ProductDocument] CHECK CONSTRAINT [FK_ProductDocument_Product_ProductID]
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Production].[FK_ProductDocument_Document_DocumentNode]') AND parent_object_id = OBJECT_ID('[Production].[ProductDocument]'))
BEGIN
    ALTER TABLE [Production].[ProductDocument] WITH CHECK ADD CONSTRAINT [FK_ProductDocument_Document_DocumentNode] FOREIGN KEY ([DocumentNode]) REFERENCES [Production].[Document] ([DocumentNode])
    ALTER TABLE [Production].[ProductDocument] CHECK CONSTRAINT [FK_ProductDocument_Document_DocumentNode]
END
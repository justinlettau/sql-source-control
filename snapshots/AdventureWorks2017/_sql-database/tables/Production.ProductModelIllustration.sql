IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Production].[ProductModelIllustration]') AND type = 'U')
CREATE TABLE [Production].[ProductModelIllustration]
(
    [ProductModelID] int NOT NULL,
    [IllustrationID] int NOT NULL,
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_ProductModelIllustration_ProductModelID_IllustrationID] PRIMARY KEY CLUSTERED 
    (
        [ProductModelID] ASC,
        [IllustrationID] ASC
    )
)

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Production].[FK_ProductModelIllustration_Illustration_IllustrationID]') AND parent_object_id = OBJECT_ID('[Production].[ProductModelIllustration]'))
BEGIN
    ALTER TABLE [Production].[ProductModelIllustration] WITH CHECK ADD CONSTRAINT [FK_ProductModelIllustration_Illustration_IllustrationID] FOREIGN KEY ([IllustrationID]) REFERENCES [Production].[Illustration] ([IllustrationID])
    ALTER TABLE [Production].[ProductModelIllustration] CHECK CONSTRAINT [FK_ProductModelIllustration_Illustration_IllustrationID]
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Production].[FK_ProductModelIllustration_ProductModel_ProductModelID]') AND parent_object_id = OBJECT_ID('[Production].[ProductModelIllustration]'))
BEGIN
    ALTER TABLE [Production].[ProductModelIllustration] WITH CHECK ADD CONSTRAINT [FK_ProductModelIllustration_ProductModel_ProductModelID] FOREIGN KEY ([ProductModelID]) REFERENCES [Production].[ProductModel] ([ProductModelID])
    ALTER TABLE [Production].[ProductModelIllustration] CHECK CONSTRAINT [FK_ProductModelIllustration_ProductModel_ProductModelID]
END
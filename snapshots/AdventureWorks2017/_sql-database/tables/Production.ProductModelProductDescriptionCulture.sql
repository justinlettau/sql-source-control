IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Production].[ProductModelProductDescriptionCulture]') AND type = 'U')
CREATE TABLE [Production].[ProductModelProductDescriptionCulture]
(
    [ProductModelID] int NOT NULL,
    [ProductDescriptionID] int NOT NULL,
    [CultureID] nchar(6) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_ProductModelProductDescriptionCulture_ProductModelID_ProductDescriptionID_CultureID] PRIMARY KEY CLUSTERED 
    (
        [ProductModelID] ASC,
        [ProductDescriptionID] ASC,
        [CultureID] ASC
    )
)

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Production].[FK_ProductModelProductDescriptionCulture_ProductDescription_ProductDescriptionID]') AND parent_object_id = OBJECT_ID('[Production].[ProductModelProductDescriptionCulture]'))
BEGIN
    ALTER TABLE [Production].[ProductModelProductDescriptionCulture] WITH CHECK ADD CONSTRAINT [FK_ProductModelProductDescriptionCulture_ProductDescription_ProductDescriptionID] FOREIGN KEY ([ProductDescriptionID]) REFERENCES [Production].[ProductDescription] ([ProductDescriptionID])
    ALTER TABLE [Production].[ProductModelProductDescriptionCulture] CHECK CONSTRAINT [FK_ProductModelProductDescriptionCulture_ProductDescription_ProductDescriptionID]
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Production].[FK_ProductModelProductDescriptionCulture_ProductModel_ProductModelID]') AND parent_object_id = OBJECT_ID('[Production].[ProductModelProductDescriptionCulture]'))
BEGIN
    ALTER TABLE [Production].[ProductModelProductDescriptionCulture] WITH CHECK ADD CONSTRAINT [FK_ProductModelProductDescriptionCulture_ProductModel_ProductModelID] FOREIGN KEY ([ProductModelID]) REFERENCES [Production].[ProductModel] ([ProductModelID])
    ALTER TABLE [Production].[ProductModelProductDescriptionCulture] CHECK CONSTRAINT [FK_ProductModelProductDescriptionCulture_ProductModel_ProductModelID]
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Production].[FK_ProductModelProductDescriptionCulture_Culture_CultureID]') AND parent_object_id = OBJECT_ID('[Production].[ProductModelProductDescriptionCulture]'))
BEGIN
    ALTER TABLE [Production].[ProductModelProductDescriptionCulture] WITH CHECK ADD CONSTRAINT [FK_ProductModelProductDescriptionCulture_Culture_CultureID] FOREIGN KEY ([CultureID]) REFERENCES [Production].[Culture] ([CultureID])
    ALTER TABLE [Production].[ProductModelProductDescriptionCulture] CHECK CONSTRAINT [FK_ProductModelProductDescriptionCulture_Culture_CultureID]
END
IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Production].[ProductDescription]') AND type = 'U')
CREATE TABLE [Production].[ProductDescription]
(
    [ProductDescriptionID] int NOT NULL IDENTITY(1, 1),
    [Description] nvarchar(400) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [rowguid] uniqueidentifier NOT NULL DEFAULT(newid()),
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_ProductDescription_ProductDescriptionID] PRIMARY KEY CLUSTERED ([ProductDescriptionID] ASC)
)

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Production].[ProductDescription]') AND name = 'AK_ProductDescription_rowguid')
CREATE UNIQUE NONCLUSTERED INDEX [AK_ProductDescription_rowguid] ON [Production].[ProductDescription]([rowguid] ASC)
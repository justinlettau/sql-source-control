IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Production].[ProductPhoto]') AND type = 'U')
CREATE TABLE [Production].[ProductPhoto]
(
    [ProductPhotoID] int NOT NULL IDENTITY(1, 1),
    [ThumbNailPhoto] varbinary(max) NULL,
    [ThumbnailPhotoFileName] nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
    [LargePhoto] varbinary(max) NULL,
    [LargePhotoFileName] nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_ProductPhoto_ProductPhotoID] PRIMARY KEY CLUSTERED ([ProductPhotoID] ASC)
)
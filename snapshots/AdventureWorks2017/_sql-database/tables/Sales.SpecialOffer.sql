IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Sales].[SpecialOffer]') AND type = 'U')
CREATE TABLE [Sales].[SpecialOffer]
(
    [SpecialOfferID] int NOT NULL IDENTITY(1, 1),
    [Description] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [DiscountPct] smallmoney NOT NULL DEFAULT((0.00)),
    [Type] nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [Category] nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [StartDate] datetime NOT NULL,
    [EndDate] datetime NOT NULL,
    [MinQty] int NOT NULL DEFAULT((0)),
    [MaxQty] int NULL,
    [rowguid] uniqueidentifier NOT NULL DEFAULT(newid()),
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_SpecialOffer_SpecialOfferID] PRIMARY KEY CLUSTERED ([SpecialOfferID] ASC)
)

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Sales].[SpecialOffer]') AND name = 'AK_SpecialOffer_rowguid')
CREATE UNIQUE NONCLUSTERED INDEX [AK_SpecialOffer_rowguid] ON [Sales].[SpecialOffer]([rowguid] ASC)
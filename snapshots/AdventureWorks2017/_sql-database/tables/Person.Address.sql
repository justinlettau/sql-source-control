IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Person].[Address]') AND type = 'U')
CREATE TABLE [Person].[Address]
(
    [AddressID] int NOT NULL IDENTITY(1, 1),
    [AddressLine1] nvarchar(60) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [AddressLine2] nvarchar(60) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
    [City] nvarchar(30) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [StateProvinceID] int NOT NULL,
    [PostalCode] nvarchar(15) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [SpatialLocation] geography NULL,
    [rowguid] uniqueidentifier NOT NULL DEFAULT(newid()),
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_Address_AddressID] PRIMARY KEY CLUSTERED ([AddressID] ASC)
)

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Person].[FK_Address_StateProvince_StateProvinceID]') AND parent_object_id = OBJECT_ID('[Person].[Address]'))
BEGIN
    ALTER TABLE [Person].[Address] WITH CHECK ADD CONSTRAINT [FK_Address_StateProvince_StateProvinceID] FOREIGN KEY ([StateProvinceID]) REFERENCES [Person].[StateProvince] ([StateProvinceID])
    ALTER TABLE [Person].[Address] CHECK CONSTRAINT [FK_Address_StateProvince_StateProvinceID]
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Person].[Address]') AND name = 'AK_Address_rowguid')
CREATE UNIQUE NONCLUSTERED INDEX [AK_Address_rowguid] ON [Person].[Address]([rowguid] ASC)

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Person].[Address]') AND name = 'IX_Address_AddressLine1_AddressLine2_City_StateProvinceID_PostalCode')
CREATE UNIQUE NONCLUSTERED INDEX [IX_Address_AddressLine1_AddressLine2_City_StateProvinceID_PostalCode] ON [Person].[Address](
    [AddressLine1] ASC,
    [AddressLine2] ASC,
    [City] ASC,
    [StateProvinceID] ASC,
    [PostalCode] ASC
)

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Person].[Address]') AND name = 'IX_Address_StateProvinceID')
CREATE NONCLUSTERED INDEX [IX_Address_StateProvinceID] ON [Person].[Address]([StateProvinceID] ASC)
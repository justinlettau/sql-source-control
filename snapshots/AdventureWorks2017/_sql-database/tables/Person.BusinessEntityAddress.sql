IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Person].[BusinessEntityAddress]') AND type = 'U')
CREATE TABLE [Person].[BusinessEntityAddress]
(
    [BusinessEntityID] int NOT NULL,
    [AddressID] int NOT NULL,
    [AddressTypeID] int NOT NULL,
    [rowguid] uniqueidentifier NOT NULL DEFAULT(newid()),
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_BusinessEntityAddress_BusinessEntityID_AddressID_AddressTypeID] PRIMARY KEY CLUSTERED 
    (
        [BusinessEntityID] ASC,
        [AddressID] ASC,
        [AddressTypeID] ASC
    )
)

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Person].[FK_BusinessEntityAddress_Address_AddressID]') AND parent_object_id = OBJECT_ID('[Person].[BusinessEntityAddress]'))
BEGIN
    ALTER TABLE [Person].[BusinessEntityAddress] WITH CHECK ADD CONSTRAINT [FK_BusinessEntityAddress_Address_AddressID] FOREIGN KEY ([AddressID]) REFERENCES [Person].[Address] ([AddressID])
    ALTER TABLE [Person].[BusinessEntityAddress] CHECK CONSTRAINT [FK_BusinessEntityAddress_Address_AddressID]
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Person].[FK_BusinessEntityAddress_AddressType_AddressTypeID]') AND parent_object_id = OBJECT_ID('[Person].[BusinessEntityAddress]'))
BEGIN
    ALTER TABLE [Person].[BusinessEntityAddress] WITH CHECK ADD CONSTRAINT [FK_BusinessEntityAddress_AddressType_AddressTypeID] FOREIGN KEY ([AddressTypeID]) REFERENCES [Person].[AddressType] ([AddressTypeID])
    ALTER TABLE [Person].[BusinessEntityAddress] CHECK CONSTRAINT [FK_BusinessEntityAddress_AddressType_AddressTypeID]
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Person].[FK_BusinessEntityAddress_BusinessEntity_BusinessEntityID]') AND parent_object_id = OBJECT_ID('[Person].[BusinessEntityAddress]'))
BEGIN
    ALTER TABLE [Person].[BusinessEntityAddress] WITH CHECK ADD CONSTRAINT [FK_BusinessEntityAddress_BusinessEntity_BusinessEntityID] FOREIGN KEY ([BusinessEntityID]) REFERENCES [Person].[BusinessEntity] ([BusinessEntityID])
    ALTER TABLE [Person].[BusinessEntityAddress] CHECK CONSTRAINT [FK_BusinessEntityAddress_BusinessEntity_BusinessEntityID]
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Person].[BusinessEntityAddress]') AND name = 'AK_BusinessEntityAddress_rowguid')
CREATE UNIQUE NONCLUSTERED INDEX [AK_BusinessEntityAddress_rowguid] ON [Person].[BusinessEntityAddress]([rowguid] ASC)

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Person].[BusinessEntityAddress]') AND name = 'IX_BusinessEntityAddress_AddressID')
CREATE NONCLUSTERED INDEX [IX_BusinessEntityAddress_AddressID] ON [Person].[BusinessEntityAddress]([AddressID] ASC)

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Person].[BusinessEntityAddress]') AND name = 'IX_BusinessEntityAddress_AddressTypeID')
CREATE NONCLUSTERED INDEX [IX_BusinessEntityAddress_AddressTypeID] ON [Person].[BusinessEntityAddress]([AddressTypeID] ASC)
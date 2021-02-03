IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Person].[EmailAddress]') AND type = 'U')
CREATE TABLE [Person].[EmailAddress]
(
    [BusinessEntityID] int NOT NULL,
    [EmailAddressID] int NOT NULL IDENTITY(1, 1),
    [EmailAddress] nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
    [rowguid] uniqueidentifier NOT NULL DEFAULT(newid()),
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_EmailAddress_BusinessEntityID_EmailAddressID] PRIMARY KEY CLUSTERED 
    (
        [BusinessEntityID] ASC,
        [EmailAddressID] ASC
    )
)

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Person].[FK_EmailAddress_Person_BusinessEntityID]') AND parent_object_id = OBJECT_ID('[Person].[EmailAddress]'))
BEGIN
    ALTER TABLE [Person].[EmailAddress] WITH CHECK ADD CONSTRAINT [FK_EmailAddress_Person_BusinessEntityID] FOREIGN KEY ([BusinessEntityID]) REFERENCES [Person].[Person] ([BusinessEntityID])
    ALTER TABLE [Person].[EmailAddress] CHECK CONSTRAINT [FK_EmailAddress_Person_BusinessEntityID]
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Person].[EmailAddress]') AND name = 'IX_EmailAddress_EmailAddress')
CREATE NONCLUSTERED INDEX [IX_EmailAddress_EmailAddress] ON [Person].[EmailAddress]([EmailAddress] ASC)
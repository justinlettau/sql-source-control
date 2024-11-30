IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Person].[Person]') AND type = 'U')
CREATE TABLE [Person].[Person]
(
    [BusinessEntityID] int NOT NULL,
    [PersonType] nchar(2) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [NameStyle] NameStyle NOT NULL DEFAULT((0)),
    [Title] nvarchar(8) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
    [FirstName] Name NOT NULL,
    [MiddleName] Name NULL,
    [LastName] Name NOT NULL,
    [Suffix] nvarchar(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
    [EmailPromotion] int NOT NULL DEFAULT((0)),
    [AdditionalContactInfo] xml NULL,
    [Demographics] xml NULL,
    [rowguid] uniqueidentifier NOT NULL DEFAULT(newid()),
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_Person_BusinessEntityID] PRIMARY KEY CLUSTERED ([BusinessEntityID] ASC)
)

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Person].[FK_Person_BusinessEntity_BusinessEntityID]') AND parent_object_id = OBJECT_ID('[Person].[Person]'))
BEGIN
    ALTER TABLE [Person].[Person] WITH CHECK ADD CONSTRAINT [FK_Person_BusinessEntity_BusinessEntityID] FOREIGN KEY ([BusinessEntityID]) REFERENCES [Person].[BusinessEntity] ([BusinessEntityID])
    ALTER TABLE [Person].[Person] CHECK CONSTRAINT [FK_Person_BusinessEntity_BusinessEntityID]
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Person].[Person]') AND name = 'AK_Person_rowguid')
CREATE UNIQUE NONCLUSTERED INDEX [AK_Person_rowguid] ON [Person].[Person]([rowguid] ASC)

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Person].[Person]') AND name = 'IX_Person_LastName_FirstName_MiddleName')
CREATE NONCLUSTERED INDEX [IX_Person_LastName_FirstName_MiddleName] ON [Person].[Person](
    [LastName] ASC,
    [FirstName] ASC,
    [MiddleName] ASC
)
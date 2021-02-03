IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Person].[Password]') AND type = 'U')
CREATE TABLE [Person].[Password]
(
    [BusinessEntityID] int NOT NULL,
    [PasswordHash] varchar(128) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [PasswordSalt] varchar(10) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [rowguid] uniqueidentifier NOT NULL DEFAULT(newid()),
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_Password_BusinessEntityID] PRIMARY KEY CLUSTERED ([BusinessEntityID] ASC)
)

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Person].[FK_Password_Person_BusinessEntityID]') AND parent_object_id = OBJECT_ID('[Person].[Password]'))
BEGIN
    ALTER TABLE [Person].[Password] WITH CHECK ADD CONSTRAINT [FK_Password_Person_BusinessEntityID] FOREIGN KEY ([BusinessEntityID]) REFERENCES [Person].[Person] ([BusinessEntityID])
    ALTER TABLE [Person].[Password] CHECK CONSTRAINT [FK_Password_Person_BusinessEntityID]
END
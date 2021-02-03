IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Person].[BusinessEntityContact]') AND type = 'U')
CREATE TABLE [Person].[BusinessEntityContact]
(
    [BusinessEntityID] int NOT NULL,
    [PersonID] int NOT NULL,
    [ContactTypeID] int NOT NULL,
    [rowguid] uniqueidentifier NOT NULL DEFAULT(newid()),
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_BusinessEntityContact_BusinessEntityID_PersonID_ContactTypeID] PRIMARY KEY CLUSTERED 
    (
        [BusinessEntityID] ASC,
        [PersonID] ASC,
        [ContactTypeID] ASC
    )
)

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Person].[FK_BusinessEntityContact_Person_PersonID]') AND parent_object_id = OBJECT_ID('[Person].[BusinessEntityContact]'))
BEGIN
    ALTER TABLE [Person].[BusinessEntityContact] WITH CHECK ADD CONSTRAINT [FK_BusinessEntityContact_Person_PersonID] FOREIGN KEY ([PersonID]) REFERENCES [Person].[Person] ([BusinessEntityID])
    ALTER TABLE [Person].[BusinessEntityContact] CHECK CONSTRAINT [FK_BusinessEntityContact_Person_PersonID]
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Person].[FK_BusinessEntityContact_BusinessEntity_BusinessEntityID]') AND parent_object_id = OBJECT_ID('[Person].[BusinessEntityContact]'))
BEGIN
    ALTER TABLE [Person].[BusinessEntityContact] WITH CHECK ADD CONSTRAINT [FK_BusinessEntityContact_BusinessEntity_BusinessEntityID] FOREIGN KEY ([BusinessEntityID]) REFERENCES [Person].[BusinessEntity] ([BusinessEntityID])
    ALTER TABLE [Person].[BusinessEntityContact] CHECK CONSTRAINT [FK_BusinessEntityContact_BusinessEntity_BusinessEntityID]
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Person].[FK_BusinessEntityContact_ContactType_ContactTypeID]') AND parent_object_id = OBJECT_ID('[Person].[BusinessEntityContact]'))
BEGIN
    ALTER TABLE [Person].[BusinessEntityContact] WITH CHECK ADD CONSTRAINT [FK_BusinessEntityContact_ContactType_ContactTypeID] FOREIGN KEY ([ContactTypeID]) REFERENCES [Person].[ContactType] ([ContactTypeID])
    ALTER TABLE [Person].[BusinessEntityContact] CHECK CONSTRAINT [FK_BusinessEntityContact_ContactType_ContactTypeID]
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Person].[BusinessEntityContact]') AND name = 'AK_BusinessEntityContact_rowguid')
CREATE UNIQUE NONCLUSTERED INDEX [AK_BusinessEntityContact_rowguid] ON [Person].[BusinessEntityContact]([rowguid] ASC)

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Person].[BusinessEntityContact]') AND name = 'IX_BusinessEntityContact_PersonID')
CREATE NONCLUSTERED INDEX [IX_BusinessEntityContact_PersonID] ON [Person].[BusinessEntityContact]([PersonID] ASC)

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Person].[BusinessEntityContact]') AND name = 'IX_BusinessEntityContact_ContactTypeID')
CREATE NONCLUSTERED INDEX [IX_BusinessEntityContact_ContactTypeID] ON [Person].[BusinessEntityContact]([ContactTypeID] ASC)
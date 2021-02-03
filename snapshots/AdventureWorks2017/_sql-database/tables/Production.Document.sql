IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Production].[Document]') AND type = 'U')
CREATE TABLE [Production].[Document]
(
    [DocumentNode] hierarchyid NOT NULL,
    [DocumentLevel] AS ([DocumentNode].[GetLevel]()),
    [Title] nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [Owner] int NOT NULL,
    [FolderFlag] bit NOT NULL DEFAULT((0)),
    [FileName] nvarchar(400) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [FileExtension] nvarchar(8) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [Revision] nchar(5) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [ChangeNumber] int NOT NULL DEFAULT((0)),
    [Status] tinyint NOT NULL,
    [DocumentSummary] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
    [Document] varbinary(max) NULL,
    [rowguid] uniqueidentifier NOT NULL DEFAULT(newid()),
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_Document_DocumentNode] PRIMARY KEY CLUSTERED ([DocumentNode] ASC)
)

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Production].[FK_Document_Employee_Owner]') AND parent_object_id = OBJECT_ID('[Production].[Document]'))
BEGIN
    ALTER TABLE [Production].[Document] WITH CHECK ADD CONSTRAINT [FK_Document_Employee_Owner] FOREIGN KEY ([Owner]) REFERENCES [HumanResources].[Employee] ([BusinessEntityID])
    ALTER TABLE [Production].[Document] CHECK CONSTRAINT [FK_Document_Employee_Owner]
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Production].[Document]') AND name = 'AK_Document_rowguid')
CREATE UNIQUE NONCLUSTERED INDEX [AK_Document_rowguid] ON [Production].[Document]([rowguid] ASC)

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Production].[Document]') AND name = 'IX_Document_FileName_Revision')
CREATE NONCLUSTERED INDEX [IX_Document_FileName_Revision] ON [Production].[Document](
    [FileName] ASC,
    [Revision] ASC
)

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Production].[Document]') AND name = 'UQ__Document__F73921F7C5112C2E')
CREATE UNIQUE NONCLUSTERED INDEX [UQ__Document__F73921F7C5112C2E] ON [Production].[Document]([rowguid] ASC)

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Production].[Document]') AND name = 'AK_Document_DocumentLevel_DocumentNode')
CREATE UNIQUE NONCLUSTERED INDEX [AK_Document_DocumentLevel_DocumentNode] ON [Production].[Document](
    [DocumentLevel] ASC,
    [DocumentNode] ASC
)
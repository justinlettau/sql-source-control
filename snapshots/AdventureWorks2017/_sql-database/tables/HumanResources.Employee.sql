IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[HumanResources].[Employee]') AND type = 'U')
CREATE TABLE [HumanResources].[Employee]
(
    [BusinessEntityID] int NOT NULL,
    [NationalIDNumber] nvarchar(15) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [LoginID] nvarchar(256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [OrganizationNode] hierarchyid NULL,
    [OrganizationLevel] AS ([OrganizationNode].[GetLevel]()),
    [JobTitle] nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [BirthDate] date NOT NULL,
    [MaritalStatus] nchar(1) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [Gender] nchar(1) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [HireDate] date NOT NULL,
    [SalariedFlag] Flag NOT NULL DEFAULT((1)),
    [VacationHours] smallint NOT NULL DEFAULT((0)),
    [SickLeaveHours] smallint NOT NULL DEFAULT((0)),
    [CurrentFlag] Flag NOT NULL DEFAULT((1)),
    [rowguid] uniqueidentifier NOT NULL DEFAULT(newid()),
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_Employee_BusinessEntityID] PRIMARY KEY CLUSTERED ([BusinessEntityID] ASC)
)

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[HumanResources].[FK_Employee_Person_BusinessEntityID]') AND parent_object_id = OBJECT_ID('[HumanResources].[Employee]'))
BEGIN
    ALTER TABLE [HumanResources].[Employee] WITH CHECK ADD CONSTRAINT [FK_Employee_Person_BusinessEntityID] FOREIGN KEY ([BusinessEntityID]) REFERENCES [Person].[Person] ([BusinessEntityID])
    ALTER TABLE [HumanResources].[Employee] CHECK CONSTRAINT [FK_Employee_Person_BusinessEntityID]
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[HumanResources].[Employee]') AND name = 'IX_Employee_OrganizationNode')
CREATE NONCLUSTERED INDEX [IX_Employee_OrganizationNode] ON [HumanResources].[Employee]([OrganizationNode] ASC)

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[HumanResources].[Employee]') AND name = 'IX_Employee_OrganizationLevel_OrganizationNode')
CREATE NONCLUSTERED INDEX [IX_Employee_OrganizationLevel_OrganizationNode] ON [HumanResources].[Employee](
    [OrganizationLevel] ASC,
    [OrganizationNode] ASC
)

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[HumanResources].[Employee]') AND name = 'AK_Employee_LoginID')
CREATE UNIQUE NONCLUSTERED INDEX [AK_Employee_LoginID] ON [HumanResources].[Employee]([LoginID] ASC)

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[HumanResources].[Employee]') AND name = 'AK_Employee_NationalIDNumber')
CREATE UNIQUE NONCLUSTERED INDEX [AK_Employee_NationalIDNumber] ON [HumanResources].[Employee]([NationalIDNumber] ASC)

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[HumanResources].[Employee]') AND name = 'AK_Employee_rowguid')
CREATE UNIQUE NONCLUSTERED INDEX [AK_Employee_rowguid] ON [HumanResources].[Employee]([rowguid] ASC)
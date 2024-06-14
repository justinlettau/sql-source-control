IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[HumanResources].[Department]') AND type = 'U')
CREATE TABLE [HumanResources].[Department]
(
    [DepartmentID] smallint NOT NULL IDENTITY(1, 1),
    [Name] Name NOT NULL,
    [GroupName] Name NOT NULL,
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_Department_DepartmentID] PRIMARY KEY CLUSTERED ([DepartmentID] ASC)
)

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[HumanResources].[Department]') AND name = 'AK_Department_Name')
CREATE UNIQUE NONCLUSTERED INDEX [AK_Department_Name] ON [HumanResources].[Department]([Name] ASC)
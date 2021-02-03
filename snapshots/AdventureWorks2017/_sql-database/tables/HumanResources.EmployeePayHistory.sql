IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[HumanResources].[EmployeePayHistory]') AND type = 'U')
CREATE TABLE [HumanResources].[EmployeePayHistory]
(
    [BusinessEntityID] int NOT NULL,
    [RateChangeDate] datetime NOT NULL,
    [Rate] money NOT NULL,
    [PayFrequency] tinyint NOT NULL,
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_EmployeePayHistory_BusinessEntityID_RateChangeDate] PRIMARY KEY CLUSTERED 
    (
        [BusinessEntityID] ASC,
        [RateChangeDate] ASC
    )
)

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[HumanResources].[FK_EmployeePayHistory_Employee_BusinessEntityID]') AND parent_object_id = OBJECT_ID('[HumanResources].[EmployeePayHistory]'))
BEGIN
    ALTER TABLE [HumanResources].[EmployeePayHistory] WITH CHECK ADD CONSTRAINT [FK_EmployeePayHistory_Employee_BusinessEntityID] FOREIGN KEY ([BusinessEntityID]) REFERENCES [HumanResources].[Employee] ([BusinessEntityID])
    ALTER TABLE [HumanResources].[EmployeePayHistory] CHECK CONSTRAINT [FK_EmployeePayHistory_Employee_BusinessEntityID]
END
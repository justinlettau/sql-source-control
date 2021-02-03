IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[HumanResources].[EmployeeDepartmentHistory]') AND type = 'U')
CREATE TABLE [HumanResources].[EmployeeDepartmentHistory]
(
    [BusinessEntityID] int NOT NULL,
    [DepartmentID] smallint NOT NULL,
    [ShiftID] tinyint NOT NULL,
    [StartDate] date NOT NULL,
    [EndDate] date NULL,
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_EmployeeDepartmentHistory_BusinessEntityID_StartDate_DepartmentID] PRIMARY KEY CLUSTERED 
    (
        [BusinessEntityID] ASC,
        [StartDate] ASC,
        [DepartmentID] ASC,
        [ShiftID] ASC
    )
)

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[HumanResources].[FK_EmployeeDepartmentHistory_Department_DepartmentID]') AND parent_object_id = OBJECT_ID('[HumanResources].[EmployeeDepartmentHistory]'))
BEGIN
    ALTER TABLE [HumanResources].[EmployeeDepartmentHistory] WITH CHECK ADD CONSTRAINT [FK_EmployeeDepartmentHistory_Department_DepartmentID] FOREIGN KEY ([DepartmentID]) REFERENCES [HumanResources].[Department] ([DepartmentID])
    ALTER TABLE [HumanResources].[EmployeeDepartmentHistory] CHECK CONSTRAINT [FK_EmployeeDepartmentHistory_Department_DepartmentID]
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[HumanResources].[FK_EmployeeDepartmentHistory_Employee_BusinessEntityID]') AND parent_object_id = OBJECT_ID('[HumanResources].[EmployeeDepartmentHistory]'))
BEGIN
    ALTER TABLE [HumanResources].[EmployeeDepartmentHistory] WITH CHECK ADD CONSTRAINT [FK_EmployeeDepartmentHistory_Employee_BusinessEntityID] FOREIGN KEY ([BusinessEntityID]) REFERENCES [HumanResources].[Employee] ([BusinessEntityID])
    ALTER TABLE [HumanResources].[EmployeeDepartmentHistory] CHECK CONSTRAINT [FK_EmployeeDepartmentHistory_Employee_BusinessEntityID]
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[HumanResources].[FK_EmployeeDepartmentHistory_Shift_ShiftID]') AND parent_object_id = OBJECT_ID('[HumanResources].[EmployeeDepartmentHistory]'))
BEGIN
    ALTER TABLE [HumanResources].[EmployeeDepartmentHistory] WITH CHECK ADD CONSTRAINT [FK_EmployeeDepartmentHistory_Shift_ShiftID] FOREIGN KEY ([ShiftID]) REFERENCES [HumanResources].[Shift] ([ShiftID])
    ALTER TABLE [HumanResources].[EmployeeDepartmentHistory] CHECK CONSTRAINT [FK_EmployeeDepartmentHistory_Shift_ShiftID]
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[HumanResources].[EmployeeDepartmentHistory]') AND name = 'IX_EmployeeDepartmentHistory_DepartmentID')
CREATE NONCLUSTERED INDEX [IX_EmployeeDepartmentHistory_DepartmentID] ON [HumanResources].[EmployeeDepartmentHistory]([DepartmentID] ASC)

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[HumanResources].[EmployeeDepartmentHistory]') AND name = 'IX_EmployeeDepartmentHistory_ShiftID')
CREATE NONCLUSTERED INDEX [IX_EmployeeDepartmentHistory_ShiftID] ON [HumanResources].[EmployeeDepartmentHistory]([ShiftID] ASC)
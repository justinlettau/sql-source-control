IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Production].[WorkOrderRouting]') AND type = 'U')
CREATE TABLE [Production].[WorkOrderRouting]
(
    [WorkOrderID] int NOT NULL,
    [ProductID] int NOT NULL,
    [OperationSequence] smallint NOT NULL,
    [LocationID] smallint NOT NULL,
    [ScheduledStartDate] datetime NOT NULL,
    [ScheduledEndDate] datetime NOT NULL,
    [ActualStartDate] datetime NULL,
    [ActualEndDate] datetime NULL,
    [ActualResourceHrs] decimal(9, 4) NULL,
    [PlannedCost] money NOT NULL,
    [ActualCost] money NULL,
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_WorkOrderRouting_WorkOrderID_ProductID_OperationSequence] PRIMARY KEY CLUSTERED 
    (
        [WorkOrderID] ASC,
        [ProductID] ASC,
        [OperationSequence] ASC
    )
)

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Production].[FK_WorkOrderRouting_Location_LocationID]') AND parent_object_id = OBJECT_ID('[Production].[WorkOrderRouting]'))
BEGIN
    ALTER TABLE [Production].[WorkOrderRouting] WITH CHECK ADD CONSTRAINT [FK_WorkOrderRouting_Location_LocationID] FOREIGN KEY ([LocationID]) REFERENCES [Production].[Location] ([LocationID])
    ALTER TABLE [Production].[WorkOrderRouting] CHECK CONSTRAINT [FK_WorkOrderRouting_Location_LocationID]
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Production].[FK_WorkOrderRouting_WorkOrder_WorkOrderID]') AND parent_object_id = OBJECT_ID('[Production].[WorkOrderRouting]'))
BEGIN
    ALTER TABLE [Production].[WorkOrderRouting] WITH CHECK ADD CONSTRAINT [FK_WorkOrderRouting_WorkOrder_WorkOrderID] FOREIGN KEY ([WorkOrderID]) REFERENCES [Production].[WorkOrder] ([WorkOrderID])
    ALTER TABLE [Production].[WorkOrderRouting] CHECK CONSTRAINT [FK_WorkOrderRouting_WorkOrder_WorkOrderID]
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Production].[WorkOrderRouting]') AND name = 'IX_WorkOrderRouting_ProductID')
CREATE NONCLUSTERED INDEX [IX_WorkOrderRouting_ProductID] ON [Production].[WorkOrderRouting]([ProductID] ASC)
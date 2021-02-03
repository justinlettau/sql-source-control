IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Production].[WorkOrder]') AND type = 'U')
CREATE TABLE [Production].[WorkOrder]
(
    [WorkOrderID] int NOT NULL IDENTITY(1, 1),
    [ProductID] int NOT NULL,
    [OrderQty] int NOT NULL,
    [StockedQty] AS (isnull([OrderQty]-[ScrappedQty],(0))),
    [ScrappedQty] smallint NOT NULL,
    [StartDate] datetime NOT NULL,
    [EndDate] datetime NULL,
    [DueDate] datetime NOT NULL,
    [ScrapReasonID] smallint NULL,
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_WorkOrder_WorkOrderID] PRIMARY KEY CLUSTERED ([WorkOrderID] ASC)
)

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Production].[FK_WorkOrder_Product_ProductID]') AND parent_object_id = OBJECT_ID('[Production].[WorkOrder]'))
BEGIN
    ALTER TABLE [Production].[WorkOrder] WITH CHECK ADD CONSTRAINT [FK_WorkOrder_Product_ProductID] FOREIGN KEY ([ProductID]) REFERENCES [Production].[Product] ([ProductID])
    ALTER TABLE [Production].[WorkOrder] CHECK CONSTRAINT [FK_WorkOrder_Product_ProductID]
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Production].[FK_WorkOrder_ScrapReason_ScrapReasonID]') AND parent_object_id = OBJECT_ID('[Production].[WorkOrder]'))
BEGIN
    ALTER TABLE [Production].[WorkOrder] WITH CHECK ADD CONSTRAINT [FK_WorkOrder_ScrapReason_ScrapReasonID] FOREIGN KEY ([ScrapReasonID]) REFERENCES [Production].[ScrapReason] ([ScrapReasonID])
    ALTER TABLE [Production].[WorkOrder] CHECK CONSTRAINT [FK_WorkOrder_ScrapReason_ScrapReasonID]
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Production].[WorkOrder]') AND name = 'IX_WorkOrder_ScrapReasonID')
CREATE NONCLUSTERED INDEX [IX_WorkOrder_ScrapReasonID] ON [Production].[WorkOrder]([ScrapReasonID] ASC)

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Production].[WorkOrder]') AND name = 'IX_WorkOrder_ProductID')
CREATE NONCLUSTERED INDEX [IX_WorkOrder_ProductID] ON [Production].[WorkOrder]([ProductID] ASC)
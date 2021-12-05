IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Sales].[SalesOrderHeaderSalesReason]') AND type = 'U')
CREATE TABLE [Sales].[SalesOrderHeaderSalesReason]
(
    [SalesOrderID] int NOT NULL,
    [SalesReasonID] int NOT NULL,
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_SalesOrderHeaderSalesReason_SalesOrderID_SalesReasonID] PRIMARY KEY CLUSTERED 
    (
        [SalesOrderID] ASC,
        [SalesReasonID] ASC
    )
)

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Sales].[FK_SalesOrderHeaderSalesReason_SalesReason_SalesReasonID]') AND parent_object_id = OBJECT_ID('[Sales].[SalesOrderHeaderSalesReason]'))
BEGIN
    ALTER TABLE [Sales].[SalesOrderHeaderSalesReason] WITH CHECK ADD CONSTRAINT [FK_SalesOrderHeaderSalesReason_SalesReason_SalesReasonID] FOREIGN KEY ([SalesReasonID]) REFERENCES [Sales].[SalesReason] ([SalesReasonID])
    ALTER TABLE [Sales].[SalesOrderHeaderSalesReason] CHECK CONSTRAINT [FK_SalesOrderHeaderSalesReason_SalesReason_SalesReasonID]
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Sales].[FK_SalesOrderHeaderSalesReason_SalesOrderHeader_SalesOrderID]') AND parent_object_id = OBJECT_ID('[Sales].[SalesOrderHeaderSalesReason]'))
BEGIN
    ALTER TABLE [Sales].[SalesOrderHeaderSalesReason] WITH CHECK ADD CONSTRAINT [FK_SalesOrderHeaderSalesReason_SalesOrderHeader_SalesOrderID] FOREIGN KEY ([SalesOrderID]) REFERENCES [Sales].[SalesOrderHeader] ([SalesOrderID]) ON DELETE CASCADE
    ALTER TABLE [Sales].[SalesOrderHeaderSalesReason] CHECK CONSTRAINT [FK_SalesOrderHeaderSalesReason_SalesOrderHeader_SalesOrderID]
END
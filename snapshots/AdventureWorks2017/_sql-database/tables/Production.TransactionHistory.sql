IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Production].[TransactionHistory]') AND type = 'U')
CREATE TABLE [Production].[TransactionHistory]
(
    [TransactionID] int NOT NULL IDENTITY(100000, 1),
    [ProductID] int NOT NULL,
    [ReferenceOrderID] int NOT NULL,
    [ReferenceOrderLineID] int NOT NULL DEFAULT((0)),
    [TransactionDate] datetime NOT NULL DEFAULT(getdate()),
    [TransactionType] nchar(1) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [Quantity] int NOT NULL,
    [ActualCost] money NOT NULL,
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_TransactionHistory_TransactionID] PRIMARY KEY CLUSTERED ([TransactionID] ASC)
)

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Production].[FK_TransactionHistory_Product_ProductID]') AND parent_object_id = OBJECT_ID('[Production].[TransactionHistory]'))
BEGIN
    ALTER TABLE [Production].[TransactionHistory] WITH CHECK ADD CONSTRAINT [FK_TransactionHistory_Product_ProductID] FOREIGN KEY ([ProductID]) REFERENCES [Production].[Product] ([ProductID])
    ALTER TABLE [Production].[TransactionHistory] CHECK CONSTRAINT [FK_TransactionHistory_Product_ProductID]
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Production].[TransactionHistory]') AND name = 'IX_TransactionHistory_ProductID')
CREATE NONCLUSTERED INDEX [IX_TransactionHistory_ProductID] ON [Production].[TransactionHistory]([ProductID] ASC)

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Production].[TransactionHistory]') AND name = 'IX_TransactionHistory_ReferenceOrderID_ReferenceOrderLineID')
CREATE NONCLUSTERED INDEX [IX_TransactionHistory_ReferenceOrderID_ReferenceOrderLineID] ON [Production].[TransactionHistory](
    [ReferenceOrderID] ASC,
    [ReferenceOrderLineID] ASC
)
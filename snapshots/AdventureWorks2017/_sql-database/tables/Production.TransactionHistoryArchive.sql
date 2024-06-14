IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Production].[TransactionHistoryArchive]') AND type = 'U')
CREATE TABLE [Production].[TransactionHistoryArchive]
(
    [TransactionID] int NOT NULL,
    [ProductID] int NOT NULL,
    [ReferenceOrderID] int NOT NULL,
    [ReferenceOrderLineID] int NOT NULL DEFAULT((0)),
    [TransactionDate] datetime NOT NULL DEFAULT(getdate()),
    [TransactionType] nchar(1) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [Quantity] int NOT NULL,
    [ActualCost] money NOT NULL,
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_TransactionHistoryArchive_TransactionID] PRIMARY KEY CLUSTERED ([TransactionID] ASC)
)

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Production].[TransactionHistoryArchive]') AND name = 'IX_TransactionHistoryArchive_ProductID')
CREATE NONCLUSTERED INDEX [IX_TransactionHistoryArchive_ProductID] ON [Production].[TransactionHistoryArchive]([ProductID] ASC)

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Production].[TransactionHistoryArchive]') AND name = 'IX_TransactionHistoryArchive_ReferenceOrderID_ReferenceOrderLineID')
CREATE NONCLUSTERED INDEX [IX_TransactionHistoryArchive_ReferenceOrderID_ReferenceOrderLineID] ON [Production].[TransactionHistoryArchive](
    [ReferenceOrderID] ASC,
    [ReferenceOrderLineID] ASC
)
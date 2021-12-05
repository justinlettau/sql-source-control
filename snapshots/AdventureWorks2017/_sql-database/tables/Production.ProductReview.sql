IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Production].[ProductReview]') AND type = 'U')
CREATE TABLE [Production].[ProductReview]
(
    [ProductReviewID] int NOT NULL IDENTITY(1, 1),
    [ProductID] int NOT NULL,
    [ReviewerName] Name NOT NULL,
    [ReviewDate] datetime NOT NULL DEFAULT(getdate()),
    [EmailAddress] nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [Rating] int NOT NULL,
    [Comments] nvarchar(3850) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_ProductReview_ProductReviewID] PRIMARY KEY CLUSTERED ([ProductReviewID] ASC)
)

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Production].[FK_ProductReview_Product_ProductID]') AND parent_object_id = OBJECT_ID('[Production].[ProductReview]'))
BEGIN
    ALTER TABLE [Production].[ProductReview] WITH CHECK ADD CONSTRAINT [FK_ProductReview_Product_ProductID] FOREIGN KEY ([ProductID]) REFERENCES [Production].[Product] ([ProductID])
    ALTER TABLE [Production].[ProductReview] CHECK CONSTRAINT [FK_ProductReview_Product_ProductID]
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Production].[ProductReview]') AND name = 'IX_ProductReview_ProductID_Name')
CREATE NONCLUSTERED INDEX [IX_ProductReview_ProductID_Name] ON [Production].[ProductReview](
    [ProductID] ASC,
    [ReviewerName] ASC
)
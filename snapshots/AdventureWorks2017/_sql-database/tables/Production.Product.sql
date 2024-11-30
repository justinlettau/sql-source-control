IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Production].[Product]') AND type = 'U')
CREATE TABLE [Production].[Product]
(
    [ProductID] int NOT NULL IDENTITY(1, 1),
    [Name] Name NOT NULL,
    [ProductNumber] nvarchar(25) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [MakeFlag] Flag NOT NULL DEFAULT((1)),
    [FinishedGoodsFlag] Flag NOT NULL DEFAULT((1)),
    [Color] nvarchar(15) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
    [SafetyStockLevel] smallint NOT NULL,
    [ReorderPoint] smallint NOT NULL,
    [StandardCost] money NOT NULL,
    [ListPrice] money NOT NULL,
    [Size] nvarchar(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
    [SizeUnitMeasureCode] nchar(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
    [WeightUnitMeasureCode] nchar(3) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
    [Weight] decimal(8, 2) NULL,
    [DaysToManufacture] int NOT NULL,
    [ProductLine] nchar(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
    [Class] nchar(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
    [Style] nchar(2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
    [ProductSubcategoryID] int NULL,
    [ProductModelID] int NULL,
    [SellStartDate] datetime NOT NULL,
    [SellEndDate] datetime NULL,
    [DiscontinuedDate] datetime NULL,
    [rowguid] uniqueidentifier NOT NULL DEFAULT(newid()),
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_Product_ProductID] PRIMARY KEY CLUSTERED ([ProductID] ASC)
)

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Production].[FK_Product_UnitMeasure_SizeUnitMeasureCode]') AND parent_object_id = OBJECT_ID('[Production].[Product]'))
BEGIN
    ALTER TABLE [Production].[Product] WITH CHECK ADD CONSTRAINT [FK_Product_UnitMeasure_SizeUnitMeasureCode] FOREIGN KEY ([SizeUnitMeasureCode]) REFERENCES [Production].[UnitMeasure] ([UnitMeasureCode])
    ALTER TABLE [Production].[Product] CHECK CONSTRAINT [FK_Product_UnitMeasure_SizeUnitMeasureCode]
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Production].[FK_Product_UnitMeasure_WeightUnitMeasureCode]') AND parent_object_id = OBJECT_ID('[Production].[Product]'))
BEGIN
    ALTER TABLE [Production].[Product] WITH CHECK ADD CONSTRAINT [FK_Product_UnitMeasure_WeightUnitMeasureCode] FOREIGN KEY ([WeightUnitMeasureCode]) REFERENCES [Production].[UnitMeasure] ([UnitMeasureCode])
    ALTER TABLE [Production].[Product] CHECK CONSTRAINT [FK_Product_UnitMeasure_WeightUnitMeasureCode]
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Production].[FK_Product_ProductModel_ProductModelID]') AND parent_object_id = OBJECT_ID('[Production].[Product]'))
BEGIN
    ALTER TABLE [Production].[Product] WITH CHECK ADD CONSTRAINT [FK_Product_ProductModel_ProductModelID] FOREIGN KEY ([ProductModelID]) REFERENCES [Production].[ProductModel] ([ProductModelID])
    ALTER TABLE [Production].[Product] CHECK CONSTRAINT [FK_Product_ProductModel_ProductModelID]
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Production].[FK_Product_ProductSubcategory_ProductSubcategoryID]') AND parent_object_id = OBJECT_ID('[Production].[Product]'))
BEGIN
    ALTER TABLE [Production].[Product] WITH CHECK ADD CONSTRAINT [FK_Product_ProductSubcategory_ProductSubcategoryID] FOREIGN KEY ([ProductSubcategoryID]) REFERENCES [Production].[ProductSubcategory] ([ProductSubcategoryID])
    ALTER TABLE [Production].[Product] CHECK CONSTRAINT [FK_Product_ProductSubcategory_ProductSubcategoryID]
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Production].[Product]') AND name = 'AK_Product_Name')
CREATE UNIQUE NONCLUSTERED INDEX [AK_Product_Name] ON [Production].[Product]([Name] ASC)

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Production].[Product]') AND name = 'AK_Product_ProductNumber')
CREATE UNIQUE NONCLUSTERED INDEX [AK_Product_ProductNumber] ON [Production].[Product]([ProductNumber] ASC)

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Production].[Product]') AND name = 'AK_Product_rowguid')
CREATE UNIQUE NONCLUSTERED INDEX [AK_Product_rowguid] ON [Production].[Product]([rowguid] ASC)
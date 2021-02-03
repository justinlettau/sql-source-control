IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Sales].[SalesTaxRate]') AND type = 'U')
CREATE TABLE [Sales].[SalesTaxRate]
(
    [SalesTaxRateID] int NOT NULL IDENTITY(1, 1),
    [StateProvinceID] int NOT NULL,
    [TaxType] tinyint NOT NULL,
    [TaxRate] smallmoney NOT NULL DEFAULT((0.00)),
    [Name] Name NOT NULL,
    [rowguid] uniqueidentifier NOT NULL DEFAULT(newid()),
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_SalesTaxRate_SalesTaxRateID] PRIMARY KEY CLUSTERED ([SalesTaxRateID] ASC)
)

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Sales].[FK_SalesTaxRate_StateProvince_StateProvinceID]') AND parent_object_id = OBJECT_ID('[Sales].[SalesTaxRate]'))
BEGIN
    ALTER TABLE [Sales].[SalesTaxRate] WITH CHECK ADD CONSTRAINT [FK_SalesTaxRate_StateProvince_StateProvinceID] FOREIGN KEY ([StateProvinceID]) REFERENCES [Person].[StateProvince] ([StateProvinceID])
    ALTER TABLE [Sales].[SalesTaxRate] CHECK CONSTRAINT [FK_SalesTaxRate_StateProvince_StateProvinceID]
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Sales].[SalesTaxRate]') AND name = 'AK_SalesTaxRate_rowguid')
CREATE UNIQUE NONCLUSTERED INDEX [AK_SalesTaxRate_rowguid] ON [Sales].[SalesTaxRate]([rowguid] ASC)

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Sales].[SalesTaxRate]') AND name = 'AK_SalesTaxRate_StateProvinceID_TaxType')
CREATE UNIQUE NONCLUSTERED INDEX [AK_SalesTaxRate_StateProvinceID_TaxType] ON [Sales].[SalesTaxRate](
    [StateProvinceID] ASC,
    [TaxType] ASC
)
IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Sales].[CountryRegionCurrency]') AND type = 'U')
CREATE TABLE [Sales].[CountryRegionCurrency]
(
    [CountryRegionCode] nvarchar(3) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [CurrencyCode] nchar(3) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_CountryRegionCurrency_CountryRegionCode_CurrencyCode] PRIMARY KEY CLUSTERED 
    (
        [CountryRegionCode] ASC,
        [CurrencyCode] ASC
    )
)

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Sales].[FK_CountryRegionCurrency_CountryRegion_CountryRegionCode]') AND parent_object_id = OBJECT_ID('[Sales].[CountryRegionCurrency]'))
BEGIN
    ALTER TABLE [Sales].[CountryRegionCurrency] WITH CHECK ADD CONSTRAINT [FK_CountryRegionCurrency_CountryRegion_CountryRegionCode] FOREIGN KEY ([CountryRegionCode]) REFERENCES [Person].[CountryRegion] ([CountryRegionCode])
    ALTER TABLE [Sales].[CountryRegionCurrency] CHECK CONSTRAINT [FK_CountryRegionCurrency_CountryRegion_CountryRegionCode]
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Sales].[FK_CountryRegionCurrency_Currency_CurrencyCode]') AND parent_object_id = OBJECT_ID('[Sales].[CountryRegionCurrency]'))
BEGIN
    ALTER TABLE [Sales].[CountryRegionCurrency] WITH CHECK ADD CONSTRAINT [FK_CountryRegionCurrency_Currency_CurrencyCode] FOREIGN KEY ([CurrencyCode]) REFERENCES [Sales].[Currency] ([CurrencyCode])
    ALTER TABLE [Sales].[CountryRegionCurrency] CHECK CONSTRAINT [FK_CountryRegionCurrency_Currency_CurrencyCode]
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Sales].[CountryRegionCurrency]') AND name = 'IX_CountryRegionCurrency_CurrencyCode')
CREATE NONCLUSTERED INDEX [IX_CountryRegionCurrency_CurrencyCode] ON [Sales].[CountryRegionCurrency]([CurrencyCode] ASC)
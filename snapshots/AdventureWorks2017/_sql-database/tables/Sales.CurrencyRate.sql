IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Sales].[CurrencyRate]') AND type = 'U')
CREATE TABLE [Sales].[CurrencyRate]
(
    [CurrencyRateID] int NOT NULL IDENTITY(1, 1),
    [CurrencyRateDate] datetime NOT NULL,
    [FromCurrencyCode] nchar(3) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [ToCurrencyCode] nchar(3) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [AverageRate] money NOT NULL,
    [EndOfDayRate] money NOT NULL,
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_CurrencyRate_CurrencyRateID] PRIMARY KEY CLUSTERED ([CurrencyRateID] ASC)
)

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Sales].[FK_CurrencyRate_Currency_FromCurrencyCode]') AND parent_object_id = OBJECT_ID('[Sales].[CurrencyRate]'))
BEGIN
    ALTER TABLE [Sales].[CurrencyRate] WITH CHECK ADD CONSTRAINT [FK_CurrencyRate_Currency_FromCurrencyCode] FOREIGN KEY ([FromCurrencyCode]) REFERENCES [Sales].[Currency] ([CurrencyCode])
    ALTER TABLE [Sales].[CurrencyRate] CHECK CONSTRAINT [FK_CurrencyRate_Currency_FromCurrencyCode]
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Sales].[FK_CurrencyRate_Currency_ToCurrencyCode]') AND parent_object_id = OBJECT_ID('[Sales].[CurrencyRate]'))
BEGIN
    ALTER TABLE [Sales].[CurrencyRate] WITH CHECK ADD CONSTRAINT [FK_CurrencyRate_Currency_ToCurrencyCode] FOREIGN KEY ([ToCurrencyCode]) REFERENCES [Sales].[Currency] ([CurrencyCode])
    ALTER TABLE [Sales].[CurrencyRate] CHECK CONSTRAINT [FK_CurrencyRate_Currency_ToCurrencyCode]
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Sales].[CurrencyRate]') AND name = 'AK_CurrencyRate_CurrencyRateDate_FromCurrencyCode_ToCurrencyCode')
CREATE UNIQUE NONCLUSTERED INDEX [AK_CurrencyRate_CurrencyRateDate_FromCurrencyCode_ToCurrencyCode] ON [Sales].[CurrencyRate](
    [CurrencyRateDate] ASC,
    [FromCurrencyCode] ASC,
    [ToCurrencyCode] ASC
)
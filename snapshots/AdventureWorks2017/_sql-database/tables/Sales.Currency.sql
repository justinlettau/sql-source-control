IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Sales].[Currency]') AND type = 'U')
CREATE TABLE [Sales].[Currency]
(
    [CurrencyCode] nchar(3) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [Name] Name NOT NULL,
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_Currency_CurrencyCode] PRIMARY KEY CLUSTERED ([CurrencyCode] ASC)
)

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Sales].[Currency]') AND name = 'AK_Currency_Name')
CREATE UNIQUE NONCLUSTERED INDEX [AK_Currency_Name] ON [Sales].[Currency]([Name] ASC)
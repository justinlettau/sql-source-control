IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Sales].[CreditCard]') AND type = 'U')
CREATE TABLE [Sales].[CreditCard]
(
    [CreditCardID] int NOT NULL IDENTITY(1, 1),
    [CardType] nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [CardNumber] nvarchar(25) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [ExpMonth] tinyint NOT NULL,
    [ExpYear] smallint NOT NULL,
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_CreditCard_CreditCardID] PRIMARY KEY CLUSTERED ([CreditCardID] ASC)
)

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Sales].[CreditCard]') AND name = 'AK_CreditCard_CardNumber')
CREATE UNIQUE NONCLUSTERED INDEX [AK_CreditCard_CardNumber] ON [Sales].[CreditCard]([CardNumber] ASC)
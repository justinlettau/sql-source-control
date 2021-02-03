IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Sales].[PersonCreditCard]') AND type = 'U')
CREATE TABLE [Sales].[PersonCreditCard]
(
    [BusinessEntityID] int NOT NULL,
    [CreditCardID] int NOT NULL,
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_PersonCreditCard_BusinessEntityID_CreditCardID] PRIMARY KEY CLUSTERED 
    (
        [BusinessEntityID] ASC,
        [CreditCardID] ASC
    )
)

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Sales].[FK_PersonCreditCard_Person_BusinessEntityID]') AND parent_object_id = OBJECT_ID('[Sales].[PersonCreditCard]'))
BEGIN
    ALTER TABLE [Sales].[PersonCreditCard] WITH CHECK ADD CONSTRAINT [FK_PersonCreditCard_Person_BusinessEntityID] FOREIGN KEY ([BusinessEntityID]) REFERENCES [Person].[Person] ([BusinessEntityID])
    ALTER TABLE [Sales].[PersonCreditCard] CHECK CONSTRAINT [FK_PersonCreditCard_Person_BusinessEntityID]
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Sales].[FK_PersonCreditCard_CreditCard_CreditCardID]') AND parent_object_id = OBJECT_ID('[Sales].[PersonCreditCard]'))
BEGIN
    ALTER TABLE [Sales].[PersonCreditCard] WITH CHECK ADD CONSTRAINT [FK_PersonCreditCard_CreditCard_CreditCardID] FOREIGN KEY ([CreditCardID]) REFERENCES [Sales].[CreditCard] ([CreditCardID])
    ALTER TABLE [Sales].[PersonCreditCard] CHECK CONSTRAINT [FK_PersonCreditCard_CreditCard_CreditCardID]
END
IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Purchasing].[Vendor]') AND type = 'U')
CREATE TABLE [Purchasing].[Vendor]
(
    [BusinessEntityID] int NOT NULL,
    [AccountNumber] AccountNumber NOT NULL,
    [Name] Name NOT NULL,
    [CreditRating] tinyint NOT NULL,
    [PreferredVendorStatus] Flag NOT NULL DEFAULT((1)),
    [ActiveFlag] Flag NOT NULL DEFAULT((1)),
    [PurchasingWebServiceURL] nvarchar(1024) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_Vendor_BusinessEntityID] PRIMARY KEY CLUSTERED ([BusinessEntityID] ASC)
)

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Purchasing].[FK_Vendor_BusinessEntity_BusinessEntityID]') AND parent_object_id = OBJECT_ID('[Purchasing].[Vendor]'))
BEGIN
    ALTER TABLE [Purchasing].[Vendor] WITH CHECK ADD CONSTRAINT [FK_Vendor_BusinessEntity_BusinessEntityID] FOREIGN KEY ([BusinessEntityID]) REFERENCES [Person].[BusinessEntity] ([BusinessEntityID])
    ALTER TABLE [Purchasing].[Vendor] CHECK CONSTRAINT [FK_Vendor_BusinessEntity_BusinessEntityID]
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Purchasing].[Vendor]') AND name = 'AK_Vendor_AccountNumber')
CREATE UNIQUE NONCLUSTERED INDEX [AK_Vendor_AccountNumber] ON [Purchasing].[Vendor]([AccountNumber] ASC)
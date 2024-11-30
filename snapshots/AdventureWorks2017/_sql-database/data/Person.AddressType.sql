TRUNCATE TABLE [Person].[AddressType]

SET IDENTITY_INSERT [Person].[AddressType] ON

INSERT INTO [Person].[AddressType] (AddressTypeID, Name, rowguid, ModifiedDate) VALUES (1, 'Billing', 'B84F78B1-4EFE-4A0E-8CB7-70E9F112F886', '2008-04-30T00:00:00.000Z')
INSERT INTO [Person].[AddressType] (AddressTypeID, Name, rowguid, ModifiedDate) VALUES (2, 'Home', '41BC2FF6-F0FC-475F-8EB9-CEC0805AA0F2', '2008-04-30T00:00:00.000Z')
INSERT INTO [Person].[AddressType] (AddressTypeID, Name, rowguid, ModifiedDate) VALUES (3, 'Main Office', '8EEEC28C-07A2-4FB9-AD0A-42D4A0BBC575', '2008-04-30T00:00:00.000Z')
INSERT INTO [Person].[AddressType] (AddressTypeID, Name, rowguid, ModifiedDate) VALUES (4, 'Primary', '24CB3088-4345-47C4-86C5-17B535133D1E', '2008-04-30T00:00:00.000Z')
INSERT INTO [Person].[AddressType] (AddressTypeID, Name, rowguid, ModifiedDate) VALUES (5, 'Shipping', 'B29DA3F8-19A3-47DA-9DAA-15C84F4A83A5', '2008-04-30T00:00:00.000Z')
INSERT INTO [Person].[AddressType] (AddressTypeID, Name, rowguid, ModifiedDate) VALUES (6, 'Archive', 'A67F238A-5BA2-444B-966C-0467ED9C427F', '2008-04-30T00:00:00.000Z')

SET IDENTITY_INSERT [Person].[AddressType] OFF
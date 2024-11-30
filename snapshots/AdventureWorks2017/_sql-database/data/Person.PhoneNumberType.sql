TRUNCATE TABLE [Person].[PhoneNumberType]

SET IDENTITY_INSERT [Person].[PhoneNumberType] ON

INSERT INTO [Person].[PhoneNumberType] (PhoneNumberTypeID, Name, ModifiedDate) VALUES (1, 'Cell', '2017-12-13T13:19:22.273Z')
INSERT INTO [Person].[PhoneNumberType] (PhoneNumberTypeID, Name, ModifiedDate) VALUES (2, 'Home', '2017-12-13T13:19:22.273Z')
INSERT INTO [Person].[PhoneNumberType] (PhoneNumberTypeID, Name, ModifiedDate) VALUES (3, 'Work', '2017-12-13T13:19:22.273Z')

SET IDENTITY_INSERT [Person].[PhoneNumberType] OFF
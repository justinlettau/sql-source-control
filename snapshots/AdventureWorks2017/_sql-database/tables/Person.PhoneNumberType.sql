IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Person].[PhoneNumberType]') AND type = 'U')
CREATE TABLE [Person].[PhoneNumberType]
(
    [PhoneNumberTypeID] int NOT NULL IDENTITY(1, 1),
    [Name] Name NOT NULL,
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_PhoneNumberType_PhoneNumberTypeID] PRIMARY KEY CLUSTERED ([PhoneNumberTypeID] ASC)
)
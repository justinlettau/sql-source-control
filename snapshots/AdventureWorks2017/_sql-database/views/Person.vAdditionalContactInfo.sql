IF EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Person].[vAdditionalContactInfo]') AND type = 'V')
DROP VIEW [Person].[vAdditionalContactInfo]
GO

CREATE VIEW [Person].[vAdditionalContactInfo] 
AS 
SELECT 
    [BusinessEntityID] 
    ,[FirstName]
    ,[MiddleName]
    ,[LastName]
    ,[ContactInfo].ref.value(N'declare namespace ci="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactInfo"; 
        declare namespace act="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactTypes"; 
        (act:telephoneNumber)[1]/act:number', 'nvarchar(50)') AS [TelephoneNumber] 
    ,LTRIM(RTRIM([ContactInfo].ref.value(N'declare namespace ci="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactInfo"; 
        declare namespace act="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactTypes"; 
        (act:telephoneNumber/act:SpecialInstructions/text())[1]', 'nvarchar(max)'))) AS [TelephoneSpecialInstructions] 
    ,[ContactInfo].ref.value(N'declare namespace ci="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactInfo"; 
        declare namespace act="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactTypes";
        (act:homePostalAddress/act:Street)[1]', 'nvarchar(50)') AS [Street] 
    ,[ContactInfo].ref.value(N'declare namespace ci="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactInfo"; 
        declare namespace act="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactTypes"; 
        (act:homePostalAddress/act:City)[1]', 'nvarchar(50)') AS [City] 
    ,[ContactInfo].ref.value(N'declare namespace ci="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactInfo"; 
        declare namespace act="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactTypes"; 
        (act:homePostalAddress/act:StateProvince)[1]', 'nvarchar(50)') AS [StateProvince] 
    ,[ContactInfo].ref.value(N'declare namespace ci="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactInfo"; 
        declare namespace act="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactTypes"; 
        (act:homePostalAddress/act:PostalCode)[1]', 'nvarchar(50)') AS [PostalCode] 
    ,[ContactInfo].ref.value(N'declare namespace ci="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactInfo"; 
        declare namespace act="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactTypes"; 
        (act:homePostalAddress/act:CountryRegion)[1]', 'nvarchar(50)') AS [CountryRegion] 
    ,[ContactInfo].ref.value(N'declare namespace ci="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactInfo"; 
        declare namespace act="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactTypes"; 
        (act:homePostalAddress/act:SpecialInstructions/text())[1]', 'nvarchar(max)') AS [HomeAddressSpecialInstructions] 
    ,[ContactInfo].ref.value(N'declare namespace ci="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactInfo"; 
        declare namespace act="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactTypes"; 
        (act:eMail/act:eMailAddress)[1]', 'nvarchar(128)') AS [EMailAddress] 
    ,LTRIM(RTRIM([ContactInfo].ref.value(N'declare namespace ci="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactInfo"; 
        declare namespace act="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactTypes"; 
        (act:eMail/act:SpecialInstructions/text())[1]', 'nvarchar(max)'))) AS [EMailSpecialInstructions] 
    ,[ContactInfo].ref.value(N'declare namespace ci="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactInfo"; 
        declare namespace act="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactTypes"; 
        (act:eMail/act:SpecialInstructions/act:telephoneNumber/act:number)[1]', 'nvarchar(50)') AS [EMailTelephoneNumber] 
    ,[rowguid] 
    ,[ModifiedDate]
FROM [Person].[Person]
OUTER APPLY [AdditionalContactInfo].nodes(
    'declare namespace ci="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactInfo"; 
    /ci:AdditionalContactInfo') AS ContactInfo(ref) 
WHERE [AdditionalContactInfo] IS NOT NULL;
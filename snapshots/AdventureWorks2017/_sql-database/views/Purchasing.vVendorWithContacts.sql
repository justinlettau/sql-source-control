IF EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Purchasing].[vVendorWithContacts]') AND type = 'V')
DROP VIEW [Purchasing].[vVendorWithContacts]
GO

CREATE VIEW [Purchasing].[vVendorWithContacts] AS 
SELECT 
    v.[BusinessEntityID]
    ,v.[Name]
    ,ct.[Name] AS [ContactType] 
    ,p.[Title] 
    ,p.[FirstName] 
    ,p.[MiddleName] 
    ,p.[LastName] 
    ,p.[Suffix] 
    ,pp.[PhoneNumber] 
	,pnt.[Name] AS [PhoneNumberType]
    ,ea.[EmailAddress] 
    ,p.[EmailPromotion] 
FROM [Purchasing].[Vendor] v
    INNER JOIN [Person].[BusinessEntityContact] bec 
    ON bec.[BusinessEntityID] = v.[BusinessEntityID]
	INNER JOIN [Person].ContactType ct
	ON ct.[ContactTypeID] = bec.[ContactTypeID]
	INNER JOIN [Person].[Person] p
	ON p.[BusinessEntityID] = bec.[PersonID]
	LEFT OUTER JOIN [Person].[EmailAddress] ea
	ON ea.[BusinessEntityID] = p.[BusinessEntityID]
	LEFT OUTER JOIN [Person].[PersonPhone] pp
	ON pp.[BusinessEntityID] = p.[BusinessEntityID]
	LEFT OUTER JOIN [Person].[PhoneNumberType] pnt
	ON pnt.[PhoneNumberTypeID] = pp.[PhoneNumberTypeID];
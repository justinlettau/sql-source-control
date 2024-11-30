IF EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[HumanResources].[uspUpdateEmployeePersonalInfo]') AND type = 'P')
DROP PROCEDURE [HumanResources].[uspUpdateEmployeePersonalInfo]
GO

CREATE PROCEDURE [HumanResources].[uspUpdateEmployeePersonalInfo]
    @BusinessEntityID [int], 
    @NationalIDNumber [nvarchar](15), 
    @BirthDate [datetime], 
    @MaritalStatus [nchar](1), 
    @Gender [nchar](1)
WITH EXECUTE AS CALLER
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        UPDATE [HumanResources].[Employee] 
        SET [NationalIDNumber] = @NationalIDNumber 
            ,[BirthDate] = @BirthDate 
            ,[MaritalStatus] = @MaritalStatus 
            ,[Gender] = @Gender 
        WHERE [BusinessEntityID] = @BusinessEntityID;
    END TRY
    BEGIN CATCH
        EXECUTE [dbo].[uspLogError];
    END CATCH;
END;
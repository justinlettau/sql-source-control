IF EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[dbo].[ufnGetAccountingStartDate]') AND type = 'FN')
DROP FUNCTION [dbo].[ufnGetAccountingStartDate]
GO

CREATE FUNCTION [dbo].[ufnGetAccountingStartDate]()
RETURNS [datetime] 
AS 
BEGIN
    RETURN CONVERT(datetime, '20030701', 112);
END;
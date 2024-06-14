IF EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[dbo].[ufnGetAccountingEndDate]') AND type = 'FN')
DROP FUNCTION [dbo].[ufnGetAccountingEndDate]
GO

CREATE FUNCTION [dbo].[ufnGetAccountingEndDate]()
RETURNS [datetime] 
AS 
BEGIN
    RETURN DATEADD(millisecond, -2, CONVERT(datetime, '20040701', 112));
END;
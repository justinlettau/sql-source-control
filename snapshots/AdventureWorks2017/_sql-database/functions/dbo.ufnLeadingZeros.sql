IF EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[dbo].[ufnLeadingZeros]') AND type = 'FN')
DROP FUNCTION [dbo].[ufnLeadingZeros]
GO

CREATE FUNCTION [dbo].[ufnLeadingZeros](
    @Value int
) 
RETURNS varchar(8) 
WITH SCHEMABINDING 
AS 
BEGIN
    DECLARE @ReturnValue varchar(8);

    SET @ReturnValue = CONVERT(varchar(8), @Value);
    SET @ReturnValue = REPLICATE('0', 8 - DATALENGTH(@ReturnValue)) + @ReturnValue;

    RETURN (@ReturnValue);
END;
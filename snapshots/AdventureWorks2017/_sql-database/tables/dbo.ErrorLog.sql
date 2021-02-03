IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[dbo].[ErrorLog]') AND type = 'U')
CREATE TABLE [dbo].[ErrorLog]
(
    [ErrorLogID] int NOT NULL IDENTITY(1, 1),
    [ErrorTime] datetime NOT NULL DEFAULT(getdate()),
    [UserName] sysname COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [ErrorNumber] int NOT NULL,
    [ErrorSeverity] int NULL,
    [ErrorState] int NULL,
    [ErrorProcedure] nvarchar(126) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
    [ErrorLine] int NULL,
    [ErrorMessage] nvarchar(4000) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    CONSTRAINT [PK_ErrorLog_ErrorLogID] PRIMARY KEY CLUSTERED ([ErrorLogID] ASC)
)
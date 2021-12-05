IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[dbo].[DatabaseLog]') AND type = 'U')
CREATE TABLE [dbo].[DatabaseLog]
(
    [DatabaseLogID] int NOT NULL IDENTITY(1, 1),
    [PostTime] datetime NOT NULL,
    [DatabaseUser] sysname COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [Event] sysname COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [Schema] sysname COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
    [Object] sysname COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
    [TSQL] nvarchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [XmlEvent] xml NOT NULL,
    CONSTRAINT [PK_DatabaseLog_DatabaseLogID] PRIMARY KEY NONCLUSTERED ([DatabaseLogID] ASC)
)
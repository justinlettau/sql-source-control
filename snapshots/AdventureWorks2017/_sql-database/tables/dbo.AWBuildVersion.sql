IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[dbo].[AWBuildVersion]') AND type = 'U')
CREATE TABLE [dbo].[AWBuildVersion]
(
    [SystemInformationID] tinyint NOT NULL IDENTITY(1, 1),
    [Database Version] nvarchar(25) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [VersionDate] datetime NOT NULL,
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_AWBuildVersion_SystemInformationID] PRIMARY KEY CLUSTERED ([SystemInformationID] ASC)
)
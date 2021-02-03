IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Production].[Illustration]') AND type = 'U')
CREATE TABLE [Production].[Illustration]
(
    [IllustrationID] int NOT NULL IDENTITY(1, 1),
    [Diagram] xml NULL,
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_Illustration_IllustrationID] PRIMARY KEY CLUSTERED ([IllustrationID] ASC)
)
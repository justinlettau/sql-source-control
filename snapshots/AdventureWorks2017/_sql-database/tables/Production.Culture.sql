IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Production].[Culture]') AND type = 'U')
CREATE TABLE [Production].[Culture]
(
    [CultureID] nchar(6) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [Name] Name NOT NULL,
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_Culture_CultureID] PRIMARY KEY CLUSTERED ([CultureID] ASC)
)

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Production].[Culture]') AND name = 'AK_Culture_Name')
CREATE UNIQUE NONCLUSTERED INDEX [AK_Culture_Name] ON [Production].[Culture]([Name] ASC)
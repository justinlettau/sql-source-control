IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Production].[UnitMeasure]') AND type = 'U')
CREATE TABLE [Production].[UnitMeasure]
(
    [UnitMeasureCode] nchar(3) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
    [Name] Name NOT NULL,
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_UnitMeasure_UnitMeasureCode] PRIMARY KEY CLUSTERED ([UnitMeasureCode] ASC)
)

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Production].[UnitMeasure]') AND name = 'AK_UnitMeasure_Name')
CREATE UNIQUE NONCLUSTERED INDEX [AK_UnitMeasure_Name] ON [Production].[UnitMeasure]([Name] ASC)
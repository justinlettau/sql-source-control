IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[HumanResources].[Shift]') AND type = 'U')
CREATE TABLE [HumanResources].[Shift]
(
    [ShiftID] tinyint NOT NULL IDENTITY(1, 1),
    [Name] Name NOT NULL,
    [StartTime] time NOT NULL,
    [EndTime] time NOT NULL,
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_Shift_ShiftID] PRIMARY KEY CLUSTERED ([ShiftID] ASC)
)

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[HumanResources].[Shift]') AND name = 'AK_Shift_Name')
CREATE UNIQUE NONCLUSTERED INDEX [AK_Shift_Name] ON [HumanResources].[Shift]([Name] ASC)

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[HumanResources].[Shift]') AND name = 'AK_Shift_StartTime_EndTime')
CREATE UNIQUE NONCLUSTERED INDEX [AK_Shift_StartTime_EndTime] ON [HumanResources].[Shift](
    [StartTime] ASC,
    [EndTime] ASC
)
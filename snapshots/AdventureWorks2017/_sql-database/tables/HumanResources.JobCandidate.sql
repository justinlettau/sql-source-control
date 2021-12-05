IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[HumanResources].[JobCandidate]') AND type = 'U')
CREATE TABLE [HumanResources].[JobCandidate]
(
    [JobCandidateID] int NOT NULL IDENTITY(1, 1),
    [BusinessEntityID] int NULL,
    [Resume] xml NULL,
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_JobCandidate_JobCandidateID] PRIMARY KEY CLUSTERED ([JobCandidateID] ASC)
)

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[HumanResources].[FK_JobCandidate_Employee_BusinessEntityID]') AND parent_object_id = OBJECT_ID('[HumanResources].[JobCandidate]'))
BEGIN
    ALTER TABLE [HumanResources].[JobCandidate] WITH CHECK ADD CONSTRAINT [FK_JobCandidate_Employee_BusinessEntityID] FOREIGN KEY ([BusinessEntityID]) REFERENCES [HumanResources].[Employee] ([BusinessEntityID])
    ALTER TABLE [HumanResources].[JobCandidate] CHECK CONSTRAINT [FK_JobCandidate_Employee_BusinessEntityID]
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[HumanResources].[JobCandidate]') AND name = 'IX_JobCandidate_BusinessEntityID')
CREATE NONCLUSTERED INDEX [IX_JobCandidate_BusinessEntityID] ON [HumanResources].[JobCandidate]([BusinessEntityID] ASC)
IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Purchasing].[PurchaseOrderHeader]') AND type = 'U')
CREATE TABLE [Purchasing].[PurchaseOrderHeader]
(
    [PurchaseOrderID] int NOT NULL IDENTITY(1, 1),
    [RevisionNumber] tinyint NOT NULL DEFAULT((0)),
    [Status] tinyint NOT NULL DEFAULT((1)),
    [EmployeeID] int NOT NULL,
    [VendorID] int NOT NULL,
    [ShipMethodID] int NOT NULL,
    [OrderDate] datetime NOT NULL DEFAULT(getdate()),
    [ShipDate] datetime NULL,
    [SubTotal] money NOT NULL DEFAULT((0.00)),
    [TaxAmt] money NOT NULL DEFAULT((0.00)),
    [Freight] money NOT NULL DEFAULT((0.00)),
    [TotalDue] AS (isnull(([SubTotal]+[TaxAmt])+[Freight],(0))) PERSISTED NOT NULL,
    [ModifiedDate] datetime NOT NULL DEFAULT(getdate()),
    CONSTRAINT [PK_PurchaseOrderHeader_PurchaseOrderID] PRIMARY KEY CLUSTERED ([PurchaseOrderID] ASC)
)

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Purchasing].[FK_PurchaseOrderHeader_Employee_EmployeeID]') AND parent_object_id = OBJECT_ID('[Purchasing].[PurchaseOrderHeader]'))
BEGIN
    ALTER TABLE [Purchasing].[PurchaseOrderHeader] WITH CHECK ADD CONSTRAINT [FK_PurchaseOrderHeader_Employee_EmployeeID] FOREIGN KEY ([EmployeeID]) REFERENCES [HumanResources].[Employee] ([BusinessEntityID])
    ALTER TABLE [Purchasing].[PurchaseOrderHeader] CHECK CONSTRAINT [FK_PurchaseOrderHeader_Employee_EmployeeID]
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Purchasing].[FK_PurchaseOrderHeader_Vendor_VendorID]') AND parent_object_id = OBJECT_ID('[Purchasing].[PurchaseOrderHeader]'))
BEGIN
    ALTER TABLE [Purchasing].[PurchaseOrderHeader] WITH CHECK ADD CONSTRAINT [FK_PurchaseOrderHeader_Vendor_VendorID] FOREIGN KEY ([VendorID]) REFERENCES [Purchasing].[Vendor] ([BusinessEntityID])
    ALTER TABLE [Purchasing].[PurchaseOrderHeader] CHECK CONSTRAINT [FK_PurchaseOrderHeader_Vendor_VendorID]
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID('[Purchasing].[FK_PurchaseOrderHeader_ShipMethod_ShipMethodID]') AND parent_object_id = OBJECT_ID('[Purchasing].[PurchaseOrderHeader]'))
BEGIN
    ALTER TABLE [Purchasing].[PurchaseOrderHeader] WITH CHECK ADD CONSTRAINT [FK_PurchaseOrderHeader_ShipMethod_ShipMethodID] FOREIGN KEY ([ShipMethodID]) REFERENCES [Purchasing].[ShipMethod] ([ShipMethodID])
    ALTER TABLE [Purchasing].[PurchaseOrderHeader] CHECK CONSTRAINT [FK_PurchaseOrderHeader_ShipMethod_ShipMethodID]
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Purchasing].[PurchaseOrderHeader]') AND name = 'IX_PurchaseOrderHeader_EmployeeID')
CREATE NONCLUSTERED INDEX [IX_PurchaseOrderHeader_EmployeeID] ON [Purchasing].[PurchaseOrderHeader]([EmployeeID] ASC)

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('[Purchasing].[PurchaseOrderHeader]') AND name = 'IX_PurchaseOrderHeader_VendorID')
CREATE NONCLUSTERED INDEX [IX_PurchaseOrderHeader_VendorID] ON [Purchasing].[PurchaseOrderHeader]([VendorID] ASC)
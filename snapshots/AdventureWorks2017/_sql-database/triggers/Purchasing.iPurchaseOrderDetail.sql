IF EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('[Purchasing].[iPurchaseOrderDetail]') AND type = 'TR')
DROP TRIGGER [Purchasing].[iPurchaseOrderDetail]
GO

CREATE TRIGGER [Purchasing].[iPurchaseOrderDetail] ON [Purchasing].[PurchaseOrderDetail] 
AFTER INSERT AS
BEGIN
    DECLARE @Count int;

    SET @Count = @@ROWCOUNT;
    IF @Count = 0 
        RETURN;

    SET NOCOUNT ON;

    BEGIN TRY
        INSERT INTO [Production].[TransactionHistory]
            ([ProductID]
            ,[ReferenceOrderID]
            ,[ReferenceOrderLineID]
            ,[TransactionType]
            ,[TransactionDate]
            ,[Quantity]
            ,[ActualCost])
        SELECT 
            inserted.[ProductID]
            ,inserted.[PurchaseOrderID]
            ,inserted.[PurchaseOrderDetailID]
            ,'P'
            ,GETDATE()
            ,inserted.[OrderQty]
            ,inserted.[UnitPrice]
        FROM inserted 
            INNER JOIN [Purchasing].[PurchaseOrderHeader] 
            ON inserted.[PurchaseOrderID] = [Purchasing].[PurchaseOrderHeader].[PurchaseOrderID];

        -- Update SubTotal in PurchaseOrderHeader record. Note that this causes the 
        -- PurchaseOrderHeader trigger to fire which will update the RevisionNumber.
        UPDATE [Purchasing].[PurchaseOrderHeader]
        SET [Purchasing].[PurchaseOrderHeader].[SubTotal] = 
            (SELECT SUM([Purchasing].[PurchaseOrderDetail].[LineTotal])
                FROM [Purchasing].[PurchaseOrderDetail]
                WHERE [Purchasing].[PurchaseOrderHeader].[PurchaseOrderID] = [Purchasing].[PurchaseOrderDetail].[PurchaseOrderID])
        WHERE [Purchasing].[PurchaseOrderHeader].[PurchaseOrderID] IN (SELECT inserted.[PurchaseOrderID] FROM inserted);
    END TRY
    BEGIN CATCH
        EXECUTE [dbo].[uspPrintError];

        -- Rollback any active or uncommittable transactions before
        -- inserting information in the ErrorLog
        IF @@TRANCOUNT > 0
        BEGIN
            ROLLBACK TRANSACTION;
        END

        EXECUTE [dbo].[uspLogError];
    END CATCH;
END;
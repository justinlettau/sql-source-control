TRUNCATE TABLE [Purchasing].[ShipMethod]

SET IDENTITY_INSERT [Purchasing].[ShipMethod] ON

INSERT INTO [Purchasing].[ShipMethod] (ShipMethodID, Name, ShipBase, ShipRate, rowguid, ModifiedDate) VALUES (1, 'XRQ - TRUCK GROUND', 3.95, 0.99, '6BE756D9-D7BE-4463-8F2C-AE60C710D606', '2008-04-30T00:00:00.000Z')
INSERT INTO [Purchasing].[ShipMethod] (ShipMethodID, Name, ShipBase, ShipRate, rowguid, ModifiedDate) VALUES (2, 'ZY - EXPRESS', 9.95, 1.99, '3455079B-F773-4DC6-8F1E-2A58649C4AB8', '2008-04-30T00:00:00.000Z')
INSERT INTO [Purchasing].[ShipMethod] (ShipMethodID, Name, ShipBase, ShipRate, rowguid, ModifiedDate) VALUES (3, 'OVERSEAS - DELUXE', 29.95, 2.99, '22F4E461-28CF-4ACE-A980-F686CF112EC8', '2008-04-30T00:00:00.000Z')
INSERT INTO [Purchasing].[ShipMethod] (ShipMethodID, Name, ShipBase, ShipRate, rowguid, ModifiedDate) VALUES (4, 'OVERNIGHT J-FAST', 21.95, 1.29, '107E8356-E7A8-463D-B60C-079FFF467F3F', '2008-04-30T00:00:00.000Z')
INSERT INTO [Purchasing].[ShipMethod] (ShipMethodID, Name, ShipBase, ShipRate, rowguid, ModifiedDate) VALUES (5, 'CARGO TRANSPORT 5', 8.99, 1.49, 'B166019A-B134-4E76-B957-2B0490C610ED', '2008-04-30T00:00:00.000Z')

SET IDENTITY_INSERT [Purchasing].[ShipMethod] OFF
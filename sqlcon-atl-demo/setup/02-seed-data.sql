/*============================================================
  SQL database in Fabric – SQL Con ATL Demo
  Setup Script 2: Seed Sample Retail Data
  
  Run AFTER 01-create-schema.sql.
  Populates ~10K orders across 500 customers, 80 products.
============================================================*/

-- ────────────────────────────────────────────────
-- Regions
-- ────────────────────────────────────────────────
INSERT INTO retail.Regions (RegionId, RegionName, Country) VALUES
(1, 'Northeast',  'United States'),
(2, 'Southeast',  'United States'),
(3, 'Midwest',    'United States'),
(4, 'Southwest',  'United States'),
(5, 'West Coast', 'United States');
GO

-- ────────────────────────────────────────────────
-- Categories
-- ────────────────────────────────────────────────
INSERT INTO retail.Categories (CategoryId, CategoryName) VALUES
(1,  'Laptops'),
(2,  'Smartphones'),
(3,  'Tablets'),
(4,  'Audio'),
(5,  'Wearables'),
(6,  'Accessories'),
(7,  'Gaming'),
(8,  'Smart Home'),
(9,  'Cameras'),
(10, 'Networking');
GO

-- ────────────────────────────────────────────────
-- Products (80 products across 10 categories)
-- ────────────────────────────────────────────────
;WITH ProductSeed AS (
    SELECT * FROM (VALUES
        ('Pro Laptop 15"',       1, 1299.99, 150),
        ('Business Laptop 14"',  1, 999.99,  200),
        ('Student Laptop 13"',   1, 599.99,  300),
        ('Ultra Laptop 16"',     1, 1799.99, 75),
        ('Budget Laptop 15"',    1, 449.99,  400),
        ('Gaming Laptop 17"',    1, 2199.99, 50),
        ('Convertible Laptop',   1, 1099.99, 120),
        ('Chromebook 14"',       1, 349.99,  500),
        ('Flagship Phone',       2, 999.99,  500),
        ('Mid-Range Phone',      2, 499.99,  800),
        ('Budget Phone',         2, 199.99,  1200),
        ('Phone Pro Max',        2, 1199.99, 300),
        ('Compact Phone',        2, 699.99,  400),
        ('Foldable Phone',       2, 1799.99, 100),
        ('Rugged Phone',         2, 599.99,  250),
        ('Phone SE',             2, 429.99,  600),
        ('Pro Tablet 12"',       3, 799.99,  200),
        ('Mini Tablet 8"',       3, 399.99,  350),
        ('Budget Tablet 10"',    3, 249.99,  500),
        ('E-Reader Tablet',      3, 139.99,  700),
        ('Kids Tablet',          3, 99.99,   400),
        ('Drawing Tablet',       3, 649.99,  150),
        ('Tablet Pro Max 13"',   3, 1099.99, 80),
        ('Tablet Air',           3, 599.99,  250),
        ('Wireless Earbuds',     4, 149.99,  800),
        ('Over-Ear Headphones',  4, 299.99,  300),
        ('Noise-Cancel Buds',    4, 249.99,  500),
        ('Studio Monitors',      4, 499.99,  100),
        ('Bluetooth Speaker',    4, 79.99,   900),
        ('Soundbar',             4, 199.99,  400),
        ('Portable Speaker',     4, 49.99,   1000),
        ('Audiophile DAC',       4, 399.99,  80),
        ('Smartwatch Pro',       5, 399.99,  400),
        ('Fitness Tracker',      5, 99.99,   800),
        ('Kids Smartwatch',      5, 149.99,  300),
        ('Luxury Smartwatch',    5, 799.99,  100),
        ('Sport Band',           5, 249.99,  500),
        ('Health Monitor Watch', 5, 349.99,  200),
        ('Smart Ring',           5, 299.99,  150),
        ('GPS Running Watch',    5, 449.99,  180),
        ('USB-C Hub',            6, 49.99,   1500),
        ('Laptop Stand',         6, 39.99,   1200),
        ('Wireless Charger',     6, 29.99,   2000),
        ('Phone Case Premium',   6, 49.99,   3000),
        ('Screen Protector',     6, 14.99,   5000),
        ('Power Bank 20K',       6, 59.99,   800),
        ('Keyboard Wireless',    6, 79.99,   600),
        ('Mouse Ergonomic',      6, 69.99,   700),
        ('Gaming Console',       7, 499.99,  300),
        ('VR Headset',           7, 399.99,  200),
        ('Gaming Controller',    7, 69.99,   800),
        ('Gaming Keyboard',      7, 149.99,  500),
        ('Gaming Mouse',         7, 79.99,   600),
        ('Gaming Monitor 27"',   7, 399.99,  250),
        ('Gaming Headset',       7, 99.99,   700),
        ('Capture Card',         7, 179.99,  150),
        ('Smart Speaker',        8, 99.99,   800),
        ('Smart Display',        8, 199.99,  400),
        ('Smart Thermostat',     8, 249.99,  300),
        ('Smart Doorbell',       8, 179.99,  350),
        ('Smart Light Kit',      8, 79.99,   600),
        ('Robot Vacuum',         8, 399.99,  200),
        ('Smart Lock',           8, 219.99,  250),
        ('Smart Plug 4-Pack',    8, 39.99,   1000),
        ('Mirrorless Camera',    9, 1299.99, 100),
        ('Action Camera',        9, 349.99,  300),
        ('Instant Camera',       9, 79.99,   500),
        ('Drone with Camera',    9, 799.99,  120),
        ('Webcam 4K',            9, 129.99,  600),
        ('Camera Lens 50mm',     9, 599.99,  80),
        ('Tripod Pro',           9, 149.99,  250),
        ('Camera Bag',           9, 89.99,   400),
        ('WiFi 6E Router',       10, 249.99, 400),
        ('Mesh WiFi System',     10, 349.99, 300),
        ('Network Switch 8-Port',10, 79.99,  500),
        ('Ethernet Cable 50ft',  10, 19.99,  2000),
        ('WiFi Range Extender',  10, 49.99,  700),
        ('Travel Router',        10, 59.99,  400),
        ('PoE Switch',           10, 129.99, 200),
        ('NAS 4-Bay',            10, 449.99, 100)
    ) AS P(ProductName, CategoryId, UnitPrice, StockQty)
)
INSERT INTO retail.Products (ProductName, CategoryId, UnitPrice, StockQty)
SELECT ProductName, CategoryId, UnitPrice, StockQty FROM ProductSeed;
GO

PRINT '✅ Products seeded: ' + CAST((SELECT COUNT(*) FROM retail.Products) AS VARCHAR);
GO

-- ────────────────────────────────────────────────
-- Customers (500, with masked PII columns)
-- ────────────────────────────────────────────────
;WITH Nums AS (
    SELECT TOP 500 ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS N
    FROM sys.all_objects a CROSS JOIN sys.all_objects b
),
Tiers AS (
    SELECT N,
        CASE 
            WHEN N % 10 = 0 THEN 'Platinum'
            WHEN N % 4  = 0 THEN 'Gold'
            ELSE 'Standard'
        END AS MemberTier,
        ((N - 1) % 5) + 1 AS RegionId
    FROM Nums
)
INSERT INTO retail.Customers (FirstName, LastName, Email, Phone, RegionId, MemberTier, SSN, CreditCard)
SELECT
    CHOOSE((N % 20) + 1, 'Emma','Liam','Olivia','Noah','Ava','James','Sophia','William',
        'Isabella','Oliver','Mia','Benjamin','Charlotte','Elijah','Amelia','Lucas',
        'Harper','Mason','Evelyn','Logan'),
    CHOOSE((N % 15) + 1, 'Smith','Johnson','Williams','Brown','Jones','Garcia','Miller',
        'Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson'),
    LOWER(CHOOSE((N % 20) + 1, 'emma','liam','olivia','noah','ava','james','sophia','william',
        'isabella','oliver','mia','benjamin','charlotte','elijah','amelia','lucas',
        'harper','mason','evelyn','logan'))
        + CAST(N AS VARCHAR) + '@contoso.com',
    '(' + RIGHT('000' + CAST(200 + (N % 800) AS VARCHAR), 3) + ') '
        + RIGHT('000' + CAST(100 + (N % 900) AS VARCHAR), 3) + '-'
        + RIGHT('0000' + CAST(1000 + N AS VARCHAR), 4),
    RegionId,
    MemberTier,
    RIGHT('000' + CAST(100 + (N % 900) AS VARCHAR), 3) + '-'
        + RIGHT('00' + CAST(10 + (N % 90) AS VARCHAR), 2) + '-'
        + RIGHT('0000' + CAST(1000 + N AS VARCHAR), 4),
    '4' + RIGHT('000' + CAST(N % 1000 AS VARCHAR), 3) + '-'
        + RIGHT('0000' + CAST(1000 + N AS VARCHAR), 4) + '-'
        + RIGHT('0000' + CAST(2000 + N AS VARCHAR), 4) + '-'
        + RIGHT('0000' + CAST(3000 + N AS VARCHAR), 4)
FROM Tiers;
GO

PRINT '✅ Customers seeded: ' + CAST((SELECT COUNT(*) FROM retail.Customers) AS VARCHAR);
GO

-- ────────────────────────────────────────────────
-- Orders + OrderItems (~10K orders, 1-4 items each)
-- ────────────────────────────────────────────────
SET NOCOUNT ON;

DECLARE @i INT = 1;
DECLARE @orderCount INT = 10000;
DECLARE @maxCustomer INT = (SELECT MAX(CustomerId) FROM retail.Customers);
DECLARE @maxProduct INT = (SELECT MAX(ProductId) FROM retail.Products);

WHILE @i <= @orderCount
BEGIN
    DECLARE @custId   INT = 1 + ABS(CHECKSUM(NEWID())) % @maxCustomer;
    DECLARE @regionId INT = (SELECT RegionId FROM retail.Customers WHERE CustomerId = @custId);
    DECLARE @orderDate DATETIME2 = DATEADD(DAY, -ABS(CHECKSUM(NEWID())) % 365, SYSUTCDATETIME());
    DECLARE @status NVARCHAR(20) = CHOOSE(1 + ABS(CHECKSUM(NEWID())) % 4, 
        'Completed','Completed','Shipped','Pending');
    DECLARE @orderId INT;

    INSERT INTO retail.Orders (CustomerId, OrderDate, Status, TotalAmount, RegionId)
    VALUES (@custId, @orderDate, @status, 0, @regionId);

    SET @orderId = SCOPE_IDENTITY();

    -- 1-4 line items per order
    DECLARE @items INT = 1 + ABS(CHECKSUM(NEWID())) % 4;
    DECLARE @j INT = 1;
    DECLARE @total DECIMAL(12,2) = 0;

    WHILE @j <= @items
    BEGIN
        DECLARE @prodId  INT = 1 + ABS(CHECKSUM(NEWID())) % @maxProduct;
        DECLARE @qty     INT = 1 + ABS(CHECKSUM(NEWID())) % 5;
        DECLARE @price   DECIMAL(10,2) = (SELECT UnitPrice FROM retail.Products WHERE ProductId = @prodId);

        INSERT INTO retail.OrderItems (OrderId, ProductId, Quantity, UnitPrice)
        VALUES (@orderId, @prodId, @qty, @price);

        SET @total += @qty * @price;
        SET @j += 1;
    END

    UPDATE retail.Orders SET TotalAmount = @total WHERE OrderId = @orderId;

    SET @i += 1;
END

SET NOCOUNT OFF;
GO

PRINT '✅ Orders seeded: ' + CAST((SELECT COUNT(*) FROM retail.Orders) AS VARCHAR);
PRINT '✅ Order items seeded: ' + CAST((SELECT COUNT(*) FROM retail.OrderItems) AS VARCHAR);
GO

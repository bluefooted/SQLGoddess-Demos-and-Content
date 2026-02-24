/*============================================================
  SQL database in Fabric – SQL Con ATL Demo
  Setup Script 1: Create Schema & Seed Data
  
  THEME ► SaaS by default – zero infrastructure, just SQL
  
  Run this BEFORE the demo to pre-populate the database so
  live segments flow smoothly within 7 minutes.
============================================================*/

-- ────────────────────────────────────────────────
-- 1. Schema
-- ────────────────────────────────────────────────
IF SCHEMA_ID('retail') IS NULL EXEC('CREATE SCHEMA retail');
GO

-- ────────────────────────────────────────────────
-- 2. Reference tables
-- ────────────────────────────────────────────────
DROP TABLE IF EXISTS retail.OrderItems;
DROP TABLE IF EXISTS retail.Orders;
DROP TABLE IF EXISTS retail.Products;
DROP TABLE IF EXISTS retail.Categories;
DROP TABLE IF EXISTS retail.Customers;
DROP TABLE IF EXISTS retail.Regions;
GO

CREATE TABLE retail.Regions (
    RegionId   INT           PRIMARY KEY,
    RegionName NVARCHAR(50)  NOT NULL,
    Country    NVARCHAR(50)  NOT NULL DEFAULT 'United States'
);

CREATE TABLE retail.Categories (
    CategoryId   INT           PRIMARY KEY,
    CategoryName NVARCHAR(100) NOT NULL
);

CREATE TABLE retail.Customers (
    CustomerId   INT            IDENTITY(1,1) PRIMARY KEY,
    FirstName    NVARCHAR(50)   NOT NULL,
    LastName     NVARCHAR(50)   NOT NULL,
    Email        NVARCHAR(200)  NOT NULL,
    Phone        NVARCHAR(20)   NULL,
    RegionId     INT            NOT NULL REFERENCES retail.Regions(RegionId),
    MemberTier   NVARCHAR(20)   NOT NULL DEFAULT 'Standard',  -- Standard, Gold, Platinum
    CreatedDate  DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME(),
    -- Sensitive columns for Dynamic Data Masking demo (Segment 4)
    SSN          CHAR(11)       NULL,
    CreditCard   NVARCHAR(19)   NULL
);

CREATE TABLE retail.Products (
    ProductId    INT            IDENTITY(1,1) PRIMARY KEY,
    ProductName  NVARCHAR(200)  NOT NULL,
    CategoryId   INT            NOT NULL REFERENCES retail.Categories(CategoryId),
    UnitPrice    DECIMAL(10,2)  NOT NULL,
    StockQty     INT            NOT NULL DEFAULT 0
);

CREATE TABLE retail.Orders (
    OrderId      INT            IDENTITY(1,1) PRIMARY KEY,
    CustomerId   INT            NOT NULL REFERENCES retail.Customers(CustomerId),
    OrderDate    DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME(),
    Status       NVARCHAR(20)   NOT NULL DEFAULT 'Pending',
    TotalAmount  DECIMAL(12,2)  NOT NULL DEFAULT 0,
    RegionId     INT            NOT NULL REFERENCES retail.Regions(RegionId)
);

CREATE TABLE retail.OrderItems (
    OrderItemId  INT            IDENTITY(1,1) PRIMARY KEY,
    OrderId      INT            NOT NULL REFERENCES retail.Orders(OrderId),
    ProductId    INT            NOT NULL REFERENCES retail.Products(ProductId),
    Quantity     INT            NOT NULL,
    UnitPrice    DECIMAL(10,2)  NOT NULL,
    LineTotal    AS (Quantity * UnitPrice) PERSISTED
);
GO

PRINT '✅ Schema created successfully.';
GO

/*============================================================
  SQL database in Fabric – SQL Con ATL Demo
  Cleanup / Reset Script
  
  Run this to tear down all demo artifacts so you can
  re-run the demo from scratch.
============================================================*/

-- ────────────────────────────────────────────────
-- 1. Drop security policy (must go before function)
-- ────────────────────────────────────────────────
IF EXISTS (SELECT 1 FROM sys.security_policies WHERE name = 'RegionSecurityPolicy')
    DROP SECURITY POLICY retail.RegionSecurityPolicy;
GO

-- ────────────────────────────────────────────────
-- 2. Drop security predicate function
-- ────────────────────────────────────────────────
DROP FUNCTION IF EXISTS retail.fn_RegionFilter;
GO

-- ────────────────────────────────────────────────
-- 3. Drop demo users
-- ────────────────────────────────────────────────
IF EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'SalesAppUser')
    DROP USER SalesAppUser;
IF EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'NortheastRep')
    DROP USER NortheastRep;
IF EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'SoutheastRep')
    DROP USER SoutheastRep;
GO

-- ────────────────────────────────────────────────
-- 4. Drop view & stored procedure (Segment 2)
-- ────────────────────────────────────────────────
DROP VIEW IF EXISTS retail.vw_OrderSummary;
DROP PROCEDURE IF EXISTS retail.usp_UpdateOrderStatus;
GO

-- ────────────────────────────────────────────────
-- 5. Drop tables (in dependency order)
-- ────────────────────────────────────────────────
DROP TABLE IF EXISTS retail.UserRegionMapping;
DROP TABLE IF EXISTS retail.OrderItems;
DROP TABLE IF EXISTS retail.Orders;
DROP TABLE IF EXISTS retail.Products;
DROP TABLE IF EXISTS retail.Categories;
DROP TABLE IF EXISTS retail.Customers;
DROP TABLE IF EXISTS retail.Regions;
GO

-- ────────────────────────────────────────────────
-- 6. Drop schema
-- ────────────────────────────────────────────────
IF SCHEMA_ID('retail') IS NOT NULL
    DROP SCHEMA retail;
GO

-- ────────────────────────────────────────────────
-- 7. Reset any changed database-scoped configs
-- ────────────────────────────────────────────────
ALTER DATABASE SCOPED CONFIGURATION SET MAXDOP = 0;
GO

PRINT '✅ Demo environment fully reset.';
PRINT '   Re-run setup/01-create-schema.sql and setup/02-seed-data.sql to rebuild.';
GO

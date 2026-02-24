/*============================================================
  SQL database in Fabric – SQL Con ATL Demo
  SEGMENT 4 ► Enterprise Security (4:30–6:00)
  
  THEME: Enterprise-ready
  
  TALKING POINTS:
  • "Autonomous performance is great, but enterprises
     need security. Let's add three layers in under
     90 seconds."
  • Dynamic Data Masking — hide PII from non-privileged users
  • Row-Level Security — restrict data visibility by region
  • Audit trail — everything is tracked
============================================================*/

-- ════════════════════════════════════════════════
-- 4A. Dynamic Data Masking
-- ════════════════════════════════════════════════
-- 🎤 "Our Customers table has SSNs and credit card numbers.
--     Let's mask them — one ALTER per column."

-- Show the sensitive data BEFORE masking (as admin)
SELECT TOP 5
    CustomerId, FirstName, LastName, Email, SSN, CreditCard
FROM retail.Customers;
GO

-- Apply masks
ALTER TABLE retail.Customers
ALTER COLUMN SSN ADD MASKED WITH (FUNCTION = 'partial(0,"XXX-XX-",4)');

ALTER TABLE retail.Customers
ALTER COLUMN CreditCard ADD MASKED WITH (FUNCTION = 'partial(0,"XXXX-XXXX-XXXX-",4)');

ALTER TABLE retail.Customers
ALTER COLUMN Email ADD MASKED WITH (FUNCTION = 'email()');

ALTER TABLE retail.Customers
ALTER COLUMN Phone ADD MASKED WITH (FUNCTION = 'default()');
GO

PRINT '✅ Dynamic Data Masking applied to 4 columns.';
GO

-- Create a test user to demonstrate masking
-- (In Fabric, you'd use Entra ID users; this simulates the effect)
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'SalesAppUser')
BEGIN
    CREATE USER SalesAppUser WITHOUT LOGIN;
    GRANT SELECT ON SCHEMA::retail TO SalesAppUser;
END;
GO

-- Show masked view
PRINT '── View as SalesAppUser (masked): ──';
EXECUTE AS USER = 'SalesAppUser';

SELECT TOP 5
    CustomerId, FirstName, LastName, Email, Phone, SSN, CreditCard
FROM retail.Customers;

REVERT;
GO

-- Show unmasked view  
PRINT '── View as Admin (unmasked): ──';
SELECT TOP 5
    CustomerId, FirstName, LastName, Email, Phone, SSN, CreditCard
FROM retail.Customers;
GO

-- ════════════════════════════════════════════════
-- 4B. Row-Level Security
-- ════════════════════════════════════════════════
-- 🎤 "Now let's restrict which ROWS users can see.
--     A regional sales rep should only see their region."

-- Create regional users
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'NortheastRep')
BEGIN
    CREATE USER NortheastRep WITHOUT LOGIN;
    CREATE USER SoutheastRep WITHOUT LOGIN;
    GRANT SELECT ON SCHEMA::retail TO NortheastRep;
    GRANT SELECT ON SCHEMA::retail TO SoutheastRep;
END;
GO

-- Map users to regions
DROP TABLE IF EXISTS retail.UserRegionMapping;
CREATE TABLE retail.UserRegionMapping (
    UserName   NVARCHAR(128),
    RegionId   INT
);
INSERT INTO retail.UserRegionMapping VALUES
('NortheastRep', 1),
('SoutheastRep', 2);
GO

-- Create the security predicate function
CREATE OR ALTER FUNCTION retail.fn_RegionFilter(@RegionId INT)
RETURNS TABLE
WITH SCHEMABINDING
AS
RETURN
    SELECT 1 AS Result
    WHERE 
        -- Admins / db_owner see everything
        IS_MEMBER('db_owner') = 1
        -- Regional users see only their region
        OR @RegionId IN (
            SELECT m.RegionId 
            FROM retail.UserRegionMapping m 
            WHERE m.UserName = USER_NAME()
        );
GO

-- Apply the security policy
IF EXISTS (SELECT 1 FROM sys.security_policies WHERE name = 'RegionSecurityPolicy')
    DROP SECURITY POLICY retail.RegionSecurityPolicy;

CREATE SECURITY POLICY retail.RegionSecurityPolicy
    ADD FILTER PREDICATE retail.fn_RegionFilter(RegionId)
    ON retail.Orders,
    ADD FILTER PREDICATE retail.fn_RegionFilter(RegionId)
    ON retail.Customers
WITH (STATE = ON);
GO

PRINT '✅ Row-Level Security policy active.';
GO

-- Demonstrate RLS
PRINT '── Orders visible to NortheastRep: ──';
EXECUTE AS USER = 'NortheastRep';
SELECT r.RegionName, COUNT(*) AS OrderCount
FROM retail.Orders o
JOIN retail.Regions r ON r.RegionId = o.RegionId
GROUP BY r.RegionName;
REVERT;
GO

PRINT '── Orders visible to SoutheastRep: ──';
EXECUTE AS USER = 'SoutheastRep';
SELECT r.RegionName, COUNT(*) AS OrderCount
FROM retail.Orders o
JOIN retail.Regions r ON r.RegionId = o.RegionId
GROUP BY r.RegionName;
REVERT;
GO

PRINT '── Orders visible to Admin (all regions): ──';
SELECT r.RegionName, COUNT(*) AS OrderCount
FROM retail.Orders o
JOIN retail.Regions r ON r.RegionId = o.RegionId
GROUP BY r.RegionName;
GO

-- ════════════════════════════════════════════════
-- 4C. Quick audit check
-- ════════════════════════════════════════════════
-- 🎤 "And auditing? It's already on. Every DDL change,
--     every security change — all tracked automatically."

-- Show recent audit events (Fabric surfaces these in the portal)
-- This queries the built-in audit log
SELECT TOP 10
    event_time,
    action_id,
    succeeded,
    server_principal_name,
    database_name,
    [statement]
FROM sys.fn_get_audit_file('', DEFAULT, DEFAULT)
WHERE database_name = DB_NAME()
ORDER BY event_time DESC;
GO

PRINT '';
PRINT '🎤 TRANSITION: "Dynamic Data Masking, Row-Level Security,';
PRINT '   and auditing — all in under 90 seconds. Enterprise-ready';
PRINT '   out of the box. For our finale, let me show you the';
PRINT '   PaaS flexibility and Copilot..."';
GO

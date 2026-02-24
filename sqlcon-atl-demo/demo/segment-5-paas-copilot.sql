/*============================================================
  SQL database in Fabric – SQL Con ATL Demo
  SEGMENT 5 ► PaaS Configurability, Copilot & Fabric 
              Integration (6:00–7:00)
  
  THEMES: PaaS configurable + SaaS by default
  
  TALKING POINTS:
  • "Everything so far was SaaS — zero config. But you're
     not locked in. You can customize when you need to."
  • Show database-scoped configurations
  • Show Copilot for natural language queries
  • Show data automatically available in OneLake
============================================================*/

-- ════════════════════════════════════════════════
-- 5A. PaaS Configurability — Database-Scoped Configs
-- ════════════════════════════════════════════════
-- 🎤 "SaaS by default, but you have full PaaS control
--     when you need it. Here are your knobs."

-- Show all configurable options
SELECT 
    name,
    value,
    value_for_secondary,
    is_value_default
FROM sys.database_scoped_configurations
ORDER BY name;
GO

-- Example: adjust MAXDOP if your workload needs it
-- (Show that you CAN change it, then revert)
ALTER DATABASE SCOPED CONFIGURATION SET MAXDOP = 4;
GO
PRINT '✅ MAXDOP set to 4 (PaaS override).';

-- Revert to autonomous default
ALTER DATABASE SCOPED CONFIGURATION SET MAXDOP = 0;
GO
PRINT '✅ MAXDOP reverted to 0 (autonomous default).';
GO

-- ════════════════════════════════════════════════
-- 5B. Copilot Natural Language to SQL
-- ════════════════════════════════════════════════
-- 🎤 "And of course, you get Copilot built in.
--     Let me just ask a question in plain English."

/*
  ┌──────────────────────────────────────────────┐
  │  SWITCH TO FABRIC PORTAL → SQL Editor        │
  │                                               │
  │  Click the Copilot button and type:           │
  │                                               │
  │  1. "Show me the top 10 customers by          │
  │      lifetime spending with their region"     │
  │                                               │
  │  2. "Which product category has the highest   │
  │      average order value in the last quarter?"│
  │                                               │
  │  3. "Find customers who haven't ordered in    │
  │      the last 90 days"                        │
  │                                               │
  │  Copilot will generate the SQL — just click   │
  │  Run to execute it live.                      │
  └──────────────────────────────────────────────┘
*/

-- Here are the expected Copilot-generated queries 
-- (keep as backup if Copilot is slow/unavailable)

-- Copilot prompt: "Top 10 customers by lifetime spending with region"
SELECT TOP 10
    c.FirstName + ' ' + c.LastName AS Customer,
    c.MemberTier,
    r.RegionName,
    SUM(o.TotalAmount)             AS LifetimeSpend,
    COUNT(o.OrderId)               AS OrderCount
FROM retail.Customers c
JOIN retail.Orders o  ON o.CustomerId = c.CustomerId
JOIN retail.Regions r ON r.RegionId = c.RegionId
GROUP BY c.FirstName, c.LastName, c.MemberTier, r.RegionName
ORDER BY LifetimeSpend DESC;
GO

-- ════════════════════════════════════════════════
-- 5C. Fabric Integration — OneLake & Cross-DB
-- ════════════════════════════════════════════════
-- 🎤 "One last thing — your SQL database data is
--     automatically available in OneLake. No ETL,
--     no pipelines. It just shows up."

/*
  ┌──────────────────────────────────────────────┐
  │  SWITCH TO FABRIC PORTAL → OneLake:          │
  │                                               │
  │  1. Open your Workspace                       │
  │  2. Navigate to OneLake data hub              │
  │  3. Show the SQL database tables appearing    │
  │     as delta-parquet automatically             │
  │  4. Open a Lakehouse or Notebook and query    │
  │     the same data with Spark                   │
  │                                               │
  │  "Zero-copy. One data platform. That's        │
  │   Microsoft Fabric."                          │
  └──────────────────────────────────────────────┘
*/

PRINT '';
PRINT '══════════════════════════════════════════════════';
PRINT '  🎤 CLOSING:';
PRINT '  "SQL database in Fabric — autonomous performance,';
PRINT '   instant APIs, enterprise security, PaaS control';
PRINT '   when you need it, and Copilot built in.';
PRINT '   SaaS by default. PaaS when you want it.';
PRINT '   Thank you!"';
PRINT '══════════════════════════════════════════════════';
GO

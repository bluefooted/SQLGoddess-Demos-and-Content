/*============================================================
  SQL database in Fabric – SQL Con ATL Demo
  SEGMENT 2 ► Autonomous Tuning (1:30–3:00)
  
  THEME: Autonomous
  
  TALKING POINTS:
  • "You just saw we can observe everything. But the engine
     doesn't just let you watch — it learns from your
     workload and tunes itself."
  • Show automatic index recommendations
  • Show IQP features enabled by default
  • Demonstrate that no DBA intervention is needed
============================================================*/

-- ════════════════════════════════════════════════
-- 2A. Run a workload that would benefit from indexes
-- ════════════════════════════════════════════════
-- 🎤 "Let me run a few queries that a real app would execute
--     repeatedly. The engine will notice the patterns."

-- Query pattern 1: Filter by status + date range (frequent in dashboards)
SELECT o.OrderId, o.OrderDate, o.TotalAmount, o.Status
FROM retail.Orders o
WHERE o.Status = 'Completed'
  AND o.OrderDate >= DATEADD(MONTH, -3, SYSUTCDATETIME())
ORDER BY o.OrderDate DESC;
GO 5  -- Run 5 times to simulate workload

-- Query pattern 2: Customer lookup by email (frequent in APIs)
SELECT c.CustomerId, c.FirstName, c.LastName, c.MemberTier
FROM retail.Customers c
WHERE c.Email = 'olivia42@contoso.com';
GO 5

-- Query pattern 3: Product search by category + price range
SELECT p.ProductId, p.ProductName, p.UnitPrice, p.StockQty
FROM retail.Products p
WHERE p.CategoryId = 2
  AND p.UnitPrice BETWEEN 400 AND 1000
ORDER BY p.UnitPrice;
GO 5

-- Query pattern 4: Order details join (frequent in order service)
SELECT 
    o.OrderId,
    o.OrderDate,
    c.FirstName + ' ' + c.LastName AS Customer,
    p.ProductName,
    oi.Quantity,
    oi.LineTotal
FROM retail.Orders o
JOIN retail.OrderItems oi ON oi.OrderId = o.OrderId
JOIN retail.Products p    ON p.ProductId = oi.ProductId
JOIN retail.Customers c   ON c.CustomerId = o.CustomerId
WHERE o.OrderId BETWEEN 500 AND 600;
GO 5

-- ════════════════════════════════════════════════
-- 3B. Check automatic index recommendations
-- ════════════════════════════════════════════════
-- 🎤 "The engine has already analyzed our workload.
--     Let's check what it recommends."

SELECT
    mig.index_group_handle,
    mid.statement                                 AS [Table],
    mid.equality_columns                          AS EqualityColumns,
    mid.inequality_columns                        AS InequalityColumns,
    mid.included_columns                          AS IncludedColumns,
    migs.avg_user_impact                          AS [AvgImpact%],
    migs.user_seeks                               AS Seeks,
    migs.last_user_seek                           AS LastSeek,
    ROUND(migs.avg_total_user_cost 
        * migs.avg_user_impact 
        * (migs.user_seeks + migs.user_scans), 2) AS ImprovementScore
FROM sys.dm_db_missing_index_groups mig
JOIN sys.dm_db_missing_index_group_stats migs 
    ON migs.group_handle = mig.index_group_handle
JOIN sys.dm_db_missing_index_details mid 
    ON mid.index_handle = mig.index_handle
WHERE mid.database_id = DB_ID()
ORDER BY ImprovementScore DESC;
GO

-- ════════════════════════════════════════════════
-- 3C. Check the automatic tuning status
-- ════════════════════════════════════════════════
-- 🎤 "Automatic tuning is ON by default. The database
--     can create indexes, force plans, and adapt —
--     all without human intervention."

SELECT
    name,
    desired_state_desc  AS DesiredState,
    actual_state_desc   AS ActualState,
    reason_desc         AS Reason
FROM sys.database_automatic_tuning_options;
GO

-- ════════════════════════════════════════════════
-- 3D. Show Query Store insights
-- ════════════════════════════════════════════════
-- 🎤 "Query Store is always on — it's tracking every
--     query, every plan, every regression."

SELECT TOP 10
    q.query_id,
    qt.query_sql_text,
    rs.count_executions                           AS Executions,
    rs.avg_duration / 1000.0                      AS [AvgDuration_ms],
    rs.avg_cpu_time / 1000.0                      AS [AvgCPU_ms],
    rs.avg_logical_io_reads                       AS AvgLogicalReads,
    p.plan_id,
    p.is_forced_plan                              AS ForcedPlan
FROM sys.query_store_query q
JOIN sys.query_store_query_text qt ON qt.query_text_id = q.query_text_id
JOIN sys.query_store_plan p        ON p.query_id = q.query_id
JOIN sys.query_store_runtime_stats rs ON rs.plan_id = p.plan_id
WHERE qt.query_sql_text NOT LIKE '%sys.%'
  AND qt.query_sql_text NOT LIKE '%query_store%'
ORDER BY rs.count_executions DESC;
GO

PRINT '';
PRINT '🎤 TRANSITION: "The database monitors itself AND tunes';
PRINT '   itself. Now let me show you something that gets a';
PRINT '   lot of applause — an instant API on your data..."';
GO

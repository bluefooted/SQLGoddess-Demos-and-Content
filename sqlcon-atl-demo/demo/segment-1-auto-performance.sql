/*============================================================
  SQL database in Fabric – SQL Con ATL Demo
  SEGMENT 1 ► Performance Observability (0:00–1:30)
  
  THEME: Autonomous + Enterprise-ready
  
  TALKING POINTS:
  • "The database is already up — my colleague just created it.
     Let's look INSIDE and see what it's doing for us."
  • Show that you get full observability out of the box —
    no monitoring stack to deploy, no agents to install.
  • Performance Dashboard, DMVs, Query Store — all built in.
  
  DEMO FLOW:
  1. Quick data overview to orient the audience
  2. Open the Performance Dashboard in the portal
  3. Query DMVs to see what the engine is tracking
  4. Show Query Store is always on, capturing everything
============================================================*/

-- ────────────────────────────────────────────────
-- 1A. Quick data overview (warm the audience up)
-- ────────────────────────────────────────────────
-- 🎤 "Here's our retail database — 500 customers, 80 products,
--     and about 10,000 orders. Let's peek under the hood."

SELECT 'Customers'  AS [Table], COUNT(*) AS [Rows] FROM retail.Customers
UNION ALL
SELECT 'Products',  COUNT(*) FROM retail.Products
UNION ALL
SELECT 'Orders',    COUNT(*) FROM retail.Orders
UNION ALL
SELECT 'OrderItems', COUNT(*) FROM retail.OrderItems;
GO

-- ════════════════════════════════════════════════
-- 1B. SWITCH TO FABRIC PORTAL — Performance Dashboard
-- ════════════════════════════════════════════════
/*
  ┌──────────────────────────────────────────────┐
  │  SWITCH TO FABRIC PORTAL:                     │
  │                                               │
  │  1. Open your SQL database item               │
  │  2. Click "Performance Dashboard"              │
  │                                               │
  │  CALL OUT:                                     │
  │  • Active queries in real time                 │
  │  • Historical CPU / DTU utilization            │
  │  • Top resource-consuming queries              │
  │  • Index recommendations (if any)              │
  │                                               │
  │  "No Grafana, no Datadog, no agents —          │
  │   this is built in."                           │
  └──────────────────────────────────────────────┘
*/

-- ────────────────────────────────────────────────
-- 1C. What's running right now? (DMVs)
-- ────────────────────────────────────────────────
-- 🎤 "Back in the query editor — let's see what the
--     engine is tracking behind the scenes. Same DMVs
--     you know from SQL Server, they just work."

-- Active sessions and what they're doing
SELECT
    s.session_id,
    s.login_name,
    s.status,
    s.cpu_time,
    s.memory_usage,
    s.reads,
    s.writes,
    s.last_request_start_time,
    t.text AS CurrentQuery
FROM sys.dm_exec_sessions s
LEFT JOIN sys.dm_exec_requests r ON r.session_id = s.session_id
OUTER APPLY sys.dm_exec_sql_text(r.sql_handle) t
WHERE s.is_user_process = 1
ORDER BY s.cpu_time DESC;
GO

-- ────────────────────────────────────────────────
-- 1D. Database resource usage & size
-- ────────────────────────────────────────────────
-- 🎤 "Full visibility into storage, connections, everything —
--     zero setup required."

SELECT
    DB_NAME()                          AS DatabaseName,
    DATABASEPROPERTYEX(DB_NAME(), 'ServiceObjective') AS ServiceTier,
    (SELECT SUM(size) * 8 / 1024 
     FROM sys.database_files)          AS SizeMB,
    (SELECT COUNT(*) 
     FROM sys.dm_exec_sessions 
     WHERE is_user_process = 1)        AS ActiveSessions;
GO

-- ────────────────────────────────────────────────
-- 1E. Query Store — always on, always capturing
-- ────────────────────────────────────────────────
-- 🎤 "Query Store is always on. Every query, every plan,
--     every execution — tracked automatically."

-- Top queries by total CPU
SELECT TOP 10
    q.query_id,
    SUBSTRING(qt.query_sql_text, 1, 80) AS QueryPreview,
    SUM(rs.count_executions)            AS TotalExecutions,
    SUM(rs.avg_cpu_time * rs.count_executions) / 1000.0  AS [TotalCPU_ms],
    AVG(rs.avg_duration) / 1000.0       AS [AvgDuration_ms],
    AVG(rs.avg_logical_io_reads)        AS AvgLogicalReads,
    COUNT(DISTINCT p.plan_id)           AS PlanCount
FROM sys.query_store_query q
JOIN sys.query_store_query_text qt ON qt.query_text_id = q.query_text_id
JOIN sys.query_store_plan p        ON p.query_id = q.query_id
JOIN sys.query_store_runtime_stats rs ON rs.plan_id = p.plan_id
WHERE qt.query_sql_text NOT LIKE '%sys.%'
  AND qt.query_sql_text NOT LIKE '%query_store%'
GROUP BY q.query_id, SUBSTRING(qt.query_sql_text, 1, 80)
ORDER BY TotalCPU_ms DESC;
GO

-- ────────────────────────────────────────────────
-- 1F. Wait stats — what is the workload waiting on?
-- ────────────────────────────────────────────────
-- 🎤 "And wait stats — same observability you'd expect
--     from SQL Server, zero configuration."

SELECT TOP 10
    wait_type,
    waiting_tasks_count                AS WaitCount,
    wait_time_ms                       AS TotalWaitMs,
    wait_time_ms / NULLIF(waiting_tasks_count, 0) AS AvgWaitMs,
    signal_wait_time_ms                AS SignalWaitMs
FROM sys.dm_os_wait_stats
WHERE wait_type NOT LIKE 'SLEEP%'
  AND wait_type NOT LIKE 'BROKER%'
  AND wait_type NOT LIKE 'XE_%'
  AND wait_type NOT IN ('WAITFOR','CLR_AUTO_EVENT',
      'REQUEST_FOR_DEADLOCK_SEARCH','LAZYWRITER_SLEEP',
      'CHECKPOINT_QUEUE','DIRTY_PAGE_POLL')
  AND waiting_tasks_count > 0
ORDER BY wait_time_ms DESC;
GO

PRINT '';
PRINT '🎤 TRANSITION: "Full observability — Performance Dashboard,';
PRINT '   DMVs, Query Store, wait stats — all built in, always on.';
PRINT '   But does it just monitor, or does it actually ACT on';
PRINT '   what it sees? Let me show you..."';
GO

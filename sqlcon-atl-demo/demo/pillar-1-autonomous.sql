/*=============================================================
  PILLAR 1 — AUTONOMOUS (0:00–2:30)
  SQL database in Fabric manages itself.
  
  Database: LoanApplicationApp
  
  BEFORE THIS SCRIPT:
  → [Portal] Show Performance Dashboard (30 sec)
     - Point out CPU, memory, query throughput graphs
     - "This is always on — zero configuration"
=============================================================*/


---------------------------------------------------------------
-- PART A: Performance Observability (0:00–1:15)
-- "Query Store is always on, always capturing"
---------------------------------------------------------------

-- 1. What's running right now? Active sessions & resource usage
SELECT 
    s.session_id,
    s.login_name,
    s.status,
    s.cpu_time,
    s.memory_usage,
    s.reads,
    s.writes,
    r.command,
    r.wait_type,
    r.wait_time
FROM sys.dm_exec_sessions s
LEFT JOIN sys.dm_exec_requests r ON s.session_id = r.session_id
WHERE s.is_user_process = 1
ORDER BY s.cpu_time DESC;
GO

-- 2. Database resource consumption — CPU, memory, I/O over time
SELECT TOP 10
    end_time,
    avg_cpu_percent,
    avg_memory_usage_percent,
    avg_data_io_percent,
    avg_log_write_percent
FROM sys.dm_db_resource_stats
ORDER BY end_time DESC;
GO

-- 3. Query Store — top queries by CPU (always on, always capturing)
SELECT TOP 10
    q.query_id,
    qt.query_sql_text,
    rs.count_executions,
    rs.avg_cpu_time / 1000.0           AS avg_cpu_ms,
    rs.avg_duration / 1000.0           AS avg_duration_ms,
    rs.avg_logical_io_reads
FROM sys.query_store_query q
JOIN sys.query_store_query_text qt ON q.query_text_id = qt.query_text_id
JOIN sys.query_store_plan p ON q.query_id = p.query_id
JOIN sys.query_store_runtime_stats rs ON p.plan_id = rs.plan_id
ORDER BY rs.avg_cpu_time * rs.count_executions DESC;
GO


---------------------------------------------------------------
-- PART B: Autonomous Tuning (1:15–2:30)
-- Run a representative workload, then show the engine reacts
---------------------------------------------------------------

-- 4. Run 4 query patterns 5x each to generate workload
--    (highlight each block and execute — they run fast)

-- Pattern 1: Dashboard query — status + date range filter
DECLARE @i INT = 1;
WHILE @i <= 5
BEGIN
    SELECT decision_status, COUNT(*) AS cnt, SUM(requested_amount) AS total
    FROM dbo.loan_applications
    WHERE decision_status = 'approved'
      AND submitted_utc >= DATEADD(MONTH, -6, GETUTCDATE())
    GROUP BY decision_status;
    SET @i += 1;
END
GO

-- Pattern 2: App/API pattern — borrower lookup by email
DECLARE @i INT = 1;
WHILE @i <= 5
BEGIN
    SELECT borrower_id, name, email, risk_tier
    FROM dbo.borrowers
    WHERE email = 'jsmith@example.com';
    SET @i += 1;
END
GO

-- Pattern 3: Search pattern — loan product + amount range
DECLARE @i INT = 1;
WHILE @i <= 5
BEGIN
    SELECT app_id, borrower_id, requested_amount, purpose_code
    FROM dbo.loan_applications
    WHERE purpose_code = 'home_purchase'
      AND requested_amount BETWEEN 100000 AND 500000;
    SET @i += 1;
END
GO

-- Pattern 4: Reporting join — applications + borrowers + credit + income
DECLARE @i INT = 1;
WHILE @i <= 5
BEGIN
    SELECT 
        la.app_id,
        b.name,
        b.risk_tier,
        la.requested_amount,
        la.decision_status,
        cs.bureau_name,
        cs.score_model,
        iv.verification_status
    FROM dbo.loan_applications la
    JOIN dbo.borrowers b       ON la.borrower_id = b.borrower_id
    JOIN dbo.credit_scores cs  ON b.borrower_id  = cs.borrower_id
    JOIN dbo.income_verifications iv ON la.app_id = iv.app_id
    WHERE la.decision_status IN ('approved','denied');
    SET @i += 1;
END
GO

-- 5. Show automatic index recommendations
SELECT 
    mid.statement                                       AS [table],
    mid.equality_columns,
    mid.inequality_columns,
    mid.included_columns,
    migs.unique_compiles,
    migs.user_seeks,
    migs.avg_total_user_cost * migs.avg_user_impact 
        * (migs.user_seeks + migs.user_scans)           AS improvement_measure
FROM sys.dm_db_missing_index_details mid
JOIN sys.dm_db_missing_index_groups mig  ON mid.index_handle = mig.index_handle
JOIN sys.dm_db_missing_index_group_stats migs ON mig.index_group_handle = migs.group_handle
ORDER BY improvement_measure DESC;
GO

-- 6. Show auto-tuning is enabled by default
SELECT 
    name,
    desired_state_desc,
    actual_state_desc,
    reason_desc
FROM sys.database_automatic_tuning_options;
GO

-- 7. Query Store insights — top queries by total CPU
SELECT TOP 5
    qt.query_sql_text,
    rs.count_executions,
    rs.avg_cpu_time / 1000.0                            AS avg_cpu_ms,
    rs.avg_duration / 1000.0                            AS avg_duration_ms,
    rs.avg_logical_io_reads,
    p.is_forced_plan
FROM sys.query_store_query q
JOIN sys.query_store_query_text qt ON q.query_text_id = qt.query_text_id
JOIN sys.query_store_plan p ON q.query_id = p.query_id
JOIN sys.query_store_runtime_stats rs ON p.plan_id = rs.plan_id
ORDER BY rs.avg_cpu_time * rs.count_executions DESC;
GO


/*=============================================================
  TRANSITION:
  "Performance takes care of itself. Now let's talk about 
   what enterprises need most — compliance and security."
  
  → Switch to pillar-2-enterprise-security.sql
=============================================================*/

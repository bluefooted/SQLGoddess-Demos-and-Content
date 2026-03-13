/*=============================================================
  PILLAR 2 — ENTERPRISE READY (2:30–5:00)
  Announcing SQL Auditing for SQL database in Fabric
  
  Database: LoanApplicationApp
  Workspace ID:  9f55fcab-c5a1-4341-bc95-8fcf8bdb88de
  Database ID:   b3d2335b-659d-405a-805c-789a33eae5fe
  
  BEFORE THIS SCRIPT:
  → [Portal] Security tab → Manage SQL Auditing (60 sec)
     - Enable "Save Events to SQL Audit Logs"
     - Walk through preconfigured scenarios:
       • Audit everything (default)
       • Permission Changes & Login Attempts
       • Data Reads and Writes
       • Schema Changes
     - Show Custom Events for strict compliance policies
     - Show Predicate Expression field (filter noise)
     - Show Retention settings (default: indefinite)
     - Click Save
     
     TALK TRACK: "We're announcing SQL auditing for SQL 
     database in Fabric. Turn it on, pick preconfigured 
     scenarios or customize to your policy. Logs are 
     immutable, stored in OneLake, included at no extra cost."
     
  → [Portal] Point out log storage location:
     OneLake/{workspace_id}/{database_id}/Audit/sqldbauditlogs/
     "Immutable, accessible via OneLake Explorer, Azure 
      Storage Explorer, or T-SQL"
=============================================================*/


---------------------------------------------------------------
-- PART B: Generate Some Auditable Activity (3:30–3:50)
-- "Let me run a few queries so we have something in the logs"
---------------------------------------------------------------

-- Quick counts
SELECT COUNT(*) AS total_applications FROM dbo.loan_applications;
GO

-- Access PII-adjacent data (borrower details)
SELECT TOP 5 
    name, 
    email, 
    risk_tier 
FROM dbo.borrowers;
GO

-- Join query — approved loan details
SELECT 
    b.name,
    la.requested_amount,
    la.decision_status
FROM dbo.loan_applications la
JOIN dbo.borrowers b ON la.borrower_id = b.borrower_id
WHERE la.decision_status = 'approved';
GO


---------------------------------------------------------------
-- PART C: Query Audit Logs via T-SQL (3:50–4:45)
-- "Here's every query we just ran — who, what, when"
---------------------------------------------------------------

-- 1. All recent audit events
SELECT TOP 20
    event_time,
    action_id,
    succeeded,
    server_principal_name,
    database_name,
    [statement]
FROM sys.fn_get_audit_file_v2(
    'https://onelake.blob.fabric.microsoft.com/9f55fcab-c5a1-4341-bc95-8fcf8bdb88de/b3d2335b-659d-405a-805c-789a33eae5fe/Audit/sqldbauditlogs/',
    DEFAULT, DEFAULT, DEFAULT, DEFAULT)
ORDER BY event_time DESC;
GO

/*
  TALK TRACK: "Here's every query we just ran — who executed it,
  the exact T-SQL statement, whether it succeeded, and when. 
  For compliance audits, forensic investigations, or just 
  understanding what's happening in your database."
*/

-- 2. Time-range query — forensic investigation
--    "Show me everything that happened in the last 10 minutes"
DECLARE @start NVARCHAR(30) = CONVERT(NVARCHAR(30), DATEADD(MINUTE, -10, SYSUTCDATETIME()), 127);
DECLARE @end   NVARCHAR(30) = CONVERT(NVARCHAR(30), SYSUTCDATETIME(), 127);

SELECT 
    event_time,
    action_id,
    server_principal_name,
    [statement]
FROM sys.fn_get_audit_file_v2(
    'https://onelake.blob.fabric.microsoft.com/9f55fcab-c5a1-4341-bc95-8fcf8bdb88de/b3d2335b-659d-405a-805c-789a33eae5fe/Audit/sqldbauditlogs/',
    DEFAULT, DEFAULT, @start, @end)
ORDER BY event_time DESC;
GO

/*
  TALK TRACK: "You can also filter by time range — perfect for 
  investigating a specific incident window. 'Show me everything 
  that happened between 2 AM and 3 AM last Tuesday.'"
*/


---------------------------------------------------------------
-- PART D: Compliance Story (4:45–5:00)
-- Talk track only — no script needed
---------------------------------------------------------------

/*
  TALK TRACK: "For financial services — HIPAA, SOX, any 
  regulated industry — auditing isn't optional. With SQL 
  database in Fabric, it's built in. Immutable logs in OneLake. 
  Preconfigured scenarios or fully custom. And included at no 
  additional cost."
  
  TRANSITION:
  "Autonomous performance, a full enterprise audit trail — 
   and it's all SaaS. But what if you need control?"
  
  → Switch to pillar-3-saas-paas.sql
*/

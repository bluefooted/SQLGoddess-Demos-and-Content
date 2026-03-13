/*=============================================================
  PILLAR 3 — SAAS BY DEFAULT, PAAS CONFIGURABLE (5:00–7:00)
  Zero config to start, full control when you need it.
  
  Database: LoanApplicationApp
=============================================================*/


---------------------------------------------------------------
-- PART A: vCore Capping — NEW FEATURE (5:00–6:15)
-- Compute (preview) in Fabric portal Settings
-- Default: 32 vCores   →   Cap to: 4 vCores
---------------------------------------------------------------

-- STEP 1: Run CPU-heavy query at default 32 vCores
--         Note the execution time

/*
  TALK TRACK: "Let me run a heavy analytical workload — this 
  cross-joins our tables into 18 million row combinations with 
  cryptographic hashing on every row."
*/

DECLARE @start DATETIME2 = SYSDATETIME();

SELECT 
    b.risk_tier,
    la.decision_status,
    COUNT(*)                            AS combination_count,
    COUNT(DISTINCT hash_val)            AS distinct_hashes,
    SUM(la.requested_amount)            AS total_requested
FROM dbo.borrowers b
CROSS JOIN dbo.loan_applications la
CROSS JOIN dbo.credit_scores cs
CROSS APPLY (
    SELECT HASHBYTES('SHA2_256', 
        CONCAT(b.name, '|', b.email, '|', la.app_id, '|', 
               cs.bureau_name, '|', cs.score_model, '|',
               NEWID())
    ) AS hash_val
) h
GROUP BY b.risk_tier, la.decision_status
ORDER BY total_requested DESC;

SELECT DATEDIFF(MILLISECOND, @start, SYSDATETIME()) AS elapsed_ms_at_32_vcores;
GO

/*
  TALK TRACK: "At 32 vCores, that took [X] seconds."

  → [Portal] STEP 2: Open database Settings → Compute (preview)
     - Show "Max vCore limit" dropdown: "32 vCores (default) (current)"
     - Change to "4 vCores" → click Save
     
  TALK TRACK: "This is a new capability — Compute settings. By 
  default, SQL database in Fabric autoscales up to 32 vCores. 
  But if you want to control costs — maybe this is a dev/test 
  database, or you have a predictable workload — you can cap it. 
  Let me set this to 4 vCores."
*/

-- STEP 3: Re-run the SAME query at 4 vCores
--         (highlight and execute this block)

DECLARE @start DATETIME2 = SYSDATETIME();

SELECT 
    b.risk_tier,
    la.decision_status,
    COUNT(*)                            AS combination_count,
    COUNT(DISTINCT hash_val)            AS distinct_hashes,
    SUM(la.requested_amount)            AS total_requested
FROM dbo.borrowers b
CROSS JOIN dbo.loan_applications la
CROSS JOIN dbo.credit_scores cs
CROSS APPLY (
    SELECT HASHBYTES('SHA2_256', 
        CONCAT(b.name, '|', b.email, '|', la.app_id, '|', 
               cs.bureau_name, '|', cs.score_model, '|',
               NEWID())
    ) AS hash_val
) h
GROUP BY b.risk_tier, la.decision_status
ORDER BY total_requested DESC;

SELECT DATEDIFF(MILLISECOND, @start, SYSDATETIME()) AS elapsed_ms_at_4_vcores;
GO

/*
  TALK TRACK: "Same query, same data — [Y] seconds. That's the 
  tradeoff. You control the compute ceiling per-database to 
  balance cost and performance."

  → [Portal] STEP 4: Reset Max vCore limit back to 
     "32 vCores (default)" → Save
     
  TALK TRACK: "And just as easily, scale it back up. This is 
  what we mean by SaaS by default, PaaS configurable."
*/


---------------------------------------------------------------
-- PART B: Copilot (6:15–6:40)
---------------------------------------------------------------

/*
  → [Portal] Open Copilot in the Fabric portal query editor
  
  Ask these natural language questions:
  
  1. "Show me the top 10 borrowers by total requested loan 
      amount with their risk tier"
  
  2. "What's the approval rate by application channel?"
  
  3. "Which borrowers have a thin credit file but an approved 
      loan application?"
*/

-- BACKUP QUERY: If Copilot hiccups, run this manually
SELECT TOP 10
    b.name,
    b.risk_tier,
    COUNT(la.app_id)                    AS application_count,
    SUM(la.requested_amount)            AS total_requested
FROM dbo.borrowers b
JOIN dbo.loan_applications la ON b.borrower_id = la.borrower_id
GROUP BY b.name, b.risk_tier
ORDER BY total_requested DESC;
GO


---------------------------------------------------------------
-- WRAP-UP (6:40–7:00)
---------------------------------------------------------------

/*
  TALK TRACK: "SQL database in Fabric: autonomous performance, 
  enterprise security, SaaS simplicity with PaaS control when 
  you need it."
  
  → Hand off to demoer #3 (Fabric integration: shortcuts, 
    pipelines, data agents)
*/

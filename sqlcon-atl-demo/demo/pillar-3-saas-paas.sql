/*=============================================================
  PILLAR 3 — SAAS BY DEFAULT, PAAS CONFIGURABLE (5:00–7:00)
  Zero config to start, full control when you need it.
  
  Database: LoanApplicationApp
=============================================================*/


---------------------------------------------------------------
-- PART A: vCore Capping — NEW FEATURE (5:00–6:15)
-- Compute (preview) in Fabric portal Settings
-- Default: 16 vCores   →   Cap to: 4 vCores
---------------------------------------------------------------

-- STEP 1: Run CPU-heavy query at default 16 vCores
--         Note the execution time

/*
  TALK TRACK: "Let me run a heavy analytical workload — a 
  risk analysis that cross-joins borrowers and loan applications 
  against vehicle collateral records."
*/

DECLARE @start DATETIME2 = SYSDATETIME();

SELECT 
    b.risk_tier,
    la.decision_status,
    COUNT(*)                                               AS combination_count,
    SUM(la.requested_amount)                               AS total_requested,
    SUM(CAST(CHECKSUM(
        CHECKSUM(b.name, b.email, b.borrower_id),
        CHECKSUM(la.app_id, la.lender_id, la.purpose_code),
        CHECKSUM(b.phone, b.risk_tier, la.requested_amount),
        CHECKSUM(c.collateral_type, c.city, c.postal_code)
    ) AS BIGINT))                                          AS hash_checksum
FROM dbo.borrowers b
CROSS JOIN dbo.loan_applications la
CROSS JOIN dbo.collaterals c
WHERE c.collateral_type = 'Vehicle'
GROUP BY b.risk_tier, la.decision_status
ORDER BY total_requested DESC;

SELECT DATEDIFF(MILLISECOND, @start, SYSDATETIME()) AS elapsed_ms_at_16_vcores;
GO

/*
  TALK TRACK: "At 16 vCores, that took [X] seconds."

  → [Portal] STEP 2: Open database Settings → Compute (preview)
     - Show "Max vCore limit" dropdown: "16 vCores (current)"
     - Change to "4 vCores" → click Save
     
  TALK TRACK: "This is a new capability — Compute settings. By 
  default, SQL database in Fabric autoscales up to 32 vCores — 
  my capacity tops out at 16. But if you want to control costs 
  — maybe this is a dev/test database, or you have a predictable 
  workload — you can cap it. Let me set this to 4 vCores."
*/

-- STEP 3: Re-run the SAME query at 4 vCores
--         (highlight and execute this block)

DECLARE @start DATETIME2 = SYSDATETIME();

SELECT 
    b.risk_tier,
    la.decision_status,
    COUNT(*)                                               AS combination_count,
    SUM(la.requested_amount)                               AS total_requested,
    SUM(CAST(CHECKSUM(
        CHECKSUM(b.name, b.email, b.borrower_id),
        CHECKSUM(la.app_id, la.lender_id, la.purpose_code),
        CHECKSUM(b.phone, b.risk_tier, la.requested_amount),
        CHECKSUM(c.collateral_type, c.city, c.postal_code)
    ) AS BIGINT))                                          AS hash_checksum
FROM dbo.borrowers b
CROSS JOIN dbo.loan_applications la
CROSS JOIN dbo.collaterals c
WHERE c.collateral_type = 'Vehicle'
GROUP BY b.risk_tier, la.decision_status
ORDER BY total_requested DESC;

SELECT DATEDIFF(MILLISECOND, @start, SYSDATETIME()) AS elapsed_ms_at_4_vcores;
GO

/*
  TALK TRACK: "Same query, same data — [Y] seconds. That's the 
  tradeoff. You control the compute ceiling per-database to 
  balance cost and performance."

  → [Portal] STEP 4: Reset Max vCore limit back to 
     "16 vCores" → Save
     
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

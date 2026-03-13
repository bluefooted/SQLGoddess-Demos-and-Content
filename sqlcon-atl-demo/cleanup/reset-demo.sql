/*============================================================
  SQL database in Fabric — FabCon Demo
  Cleanup / Reset Script
  
  Database: LoanApplicationApp
  
  This demo is read-only against the existing dbo tables.
  The only thing to reset is the vCore cap in the portal
  (if you didn't already reset it during the demo).
  
  Does NOT touch: borrowers, loan_applications, credit_scores,
  income_verifications, collaterals — those belong to the 
  shared demo and are used by demoer #3.
============================================================*/

-- ────────────────────────────────────────────────
-- 1. Portal: Reset vCore cap
-- ────────────────────────────────────────────────
/*
  → Open database Settings → Compute (preview)
  → Set "Max vCore limit" back to "32 vCores (default)"
  → Click Save
  
  (If you already reset this at the end of Pillar 3, skip.)
*/

-- ────────────────────────────────────────────────
-- 2. Portal: Auditing (optional)
-- ────────────────────────────────────────────────
/*
  Auditing can be left enabled — it doesn't affect demoer #3.
  If you want to disable it:
  → Security tab → Manage SQL Auditing → toggle off → Save
*/

-- ────────────────────────────────────────────────
-- 3. Verify existing tables are intact
-- ────────────────────────────────────────────────
SELECT 
    t.name           AS [table_name],
    p.rows           AS [row_count]
FROM sys.tables t
JOIN sys.partitions p ON t.object_id = p.object_id AND p.index_id IN (0,1)
WHERE t.name IN ('borrowers','loan_applications','credit_scores',
                  'income_verifications','collaterals')
ORDER BY t.name;
GO

PRINT '✓ Cleanup complete. Existing tables verified intact.';
GO

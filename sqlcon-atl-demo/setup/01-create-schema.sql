/*============================================================
  SQL database in Fabric — FabCon Demo
  Setup Script: Pre-Flight Validation
  
  Database: LoanApplicationApp
  
  This demo uses EXISTING tables created by the shared demo
  setup. This script validates they are present with expected
  row counts. Run before rehearsal or demo day.
  
  Does NOT create or modify any objects.
============================================================*/

-- Validate all 5 required tables exist with expected data
SELECT 
    t.name           AS [table_name],
    p.rows           AS [row_count],
    CASE 
        WHEN t.name = 'borrowers'             AND p.rows >= 200 THEN 'OK'
        WHEN t.name = 'loan_applications'     AND p.rows >= 250 THEN 'OK'
        WHEN t.name = 'credit_scores'         AND p.rows >= 200 THEN 'OK'
        WHEN t.name = 'income_verifications'  AND p.rows >= 250 THEN 'OK'
        WHEN t.name = 'collaterals'           AND p.rows >= 100 THEN 'OK'
        ELSE '** MISSING OR LOW DATA **'
    END              AS [status]
FROM sys.tables t
JOIN sys.partitions p ON t.object_id = p.object_id AND p.index_id IN (0,1)
WHERE t.name IN ('borrowers','loan_applications','credit_scores',
                  'income_verifications','collaterals')
ORDER BY t.name;
GO

-- Verify lender_id distribution for vCore capping demo context
SELECT 
    lender_id, 
    COUNT(*) AS app_count 
FROM dbo.loan_applications 
GROUP BY lender_id 
ORDER BY app_count DESC;
GO

PRINT '✓ Pre-flight validation complete. Ready for demo.';

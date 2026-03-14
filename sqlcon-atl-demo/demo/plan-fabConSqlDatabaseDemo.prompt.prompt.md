# Plan: FabCon 7-Minute SQL Database in Fabric Demo

## TL;DR
Build a 3-pillar demo on top of the **existing** `dbo` tables already in `LoanApplicationApp`. No new schema or seed data needed — the 5 existing tables (borrowers, collaterals, credit_scores, income_verifications, loan_applications) are the foundation. We add only lightweight supplementary objects (a mapping table for RLS, security policy). Cleanup removes only what we add — demoer #3's tables stay untouched. Three pillars: **Autonomous** (performance + auto-tuning), **Enterprise Ready** (RLS, auditing), **SaaS Default / PaaS Configurable** (config overrides, vcore capping, Copilot).

---

## Context & Handoffs
- **Demoer #1 (before you)**: Creates the DB, GitHub integration, developer features
- **You (Demoer #2)**: Autonomous → Enterprise Ready → SaaS/PaaS — 7 minutes, using same LoanApplicationApp database
- **Demoer #3 (after you)**: Shortcuts the existing dbo tables into Lakehouse, pipelines, data agents
- **Critical constraint**: Do NOT drop, rename, or destructively alter the 5 existing dbo tables. Everything we add must be cleanly removable.

---

## Existing Database Schema (DO NOT MODIFY STRUCTURE)

| Table | Rows | Key Columns for Demo |
|---|---|---|
| **dbo.borrowers** | 250 | `borrower_id`, `name`, `email`, `phone`, `dob`, `tax_identifier_hash`, `risk_tier`, `country_of_residence`, `is_politically_exposed_person` |
| **dbo.loan_applications** | 300 | `app_id`, `borrower_id`, `decision_status`, `lender_id`, `requested_amount`, `requested_term_months`, `submitted_utc`, `purpose_code`, `application_channel` |
| **dbo.credit_scores** | 250 | `cs_id`, `borrower_id`, `bureau_name`, `score_model`, `has_thin_file` |
| **dbo.income_verifications** | 300 | `incv_id`, `borrower_id`, `app_id`, `verification_method`, `verification_status` |
| **dbo.collaterals** | 132 | `coll_id`, `acct_id`, `collateral_type`, `region`, `city`, `postal_code` |

### What We ADD (lightweight, fully removable)
1. **dbo.LenderAccessMap** — Small mapping table: maps lender_id values for RLS demo
2. **Security predicate function** `dbo.fn_LenderFilter` — checks SESSION_CONTEXT for RLS
3. **Security policy** `dbo.LenderSecurityPolicy` — binds predicate to `loan_applications`
4. No demo users needed — RLS uses SESSION_CONTEXT, auditing is GUI-configured

### Platform Constraints (verified)
- `CREATE USER ... WITHOUT LOGIN` — **not supported** on Fabric
- `EXECUTE AS` — **not supported** on Fabric
- `sp_set_session_context` / `SESSION_CONTEXT()` — **works** on Fabric
- `sys.fn_get_audit_file_v2` — **works** on Fabric (new preview feature)

---

## Demo Structure: 3 Pillars in 7 Minutes

### Pillar 1 — AUTONOMOUS (0:00–2:30)
**Message**: "SQL database in Fabric manages itself — performance monitoring, query optimization, and index tuning happen automatically."

#### Part A: Performance Observability (0:00–1:15)
1. **[Portal]** Show Performance Dashboard in Fabric portal (30 sec)
   - Point out CPU, memory, query throughput graphs
   - "This is always on — zero configuration"
2. **[T-SQL]** Quick DMV queries (45 sec)
   - Active sessions & resource usage (`sys.dm_exec_sessions`, `sys.dm_exec_requests`)
   - Database size & resource consumption (`sys.dm_db_resource_stats`)
   - Query Store top queries by CPU — "Query Store is always on, always capturing"

#### Part B: Autonomous Tuning (1:15–2:30)
1. **[T-SQL]** Run representative workload — 4 query patterns executed 5x each (30 sec)
   - `loan_applications` by `decision_status` + `submitted_utc` date range (dashboard pattern)
   - `borrowers` lookup by `email` (API/app pattern)
   - `loan_applications` by `purpose_code` + `requested_amount` range (search pattern)
   - Complex join: `loan_applications` → `borrowers` → `credit_scores` → `income_verifications` (reporting pattern)
2. **[T-SQL]** Show automatic index recommendations from `sys.dm_db_missing_index_details` / `sys.dm_db_missing_index_group_stats` (20 sec)
3. **[T-SQL]** Show auto-tuning enabled by default: `sys.database_automatic_tuning_options` (15 sec)
4. **[T-SQL]** Query Store insights — execution counts, CPU, plan forcing (10 sec)

**Transition**: "Performance takes care of itself. Now let's talk about what enterprises need most — security."

---

### Pillar 2 — ENTERPRISE READY (2:30–5:00)
**Message**: "Enterprise-grade security and compliance built in — not bolted on."

#### Part A: Row-Level Security via SESSION_CONTEXT (2:30–3:45)

1. **[T-SQL]** Create `dbo.LenderAccessMap` table + populate with lender_id mappings (15 sec)
2. **[T-SQL]** Create inline TVF `dbo.fn_LenderFilter` — checks `SESSION_CONTEXT(N'lender_id')` against `loan_applications.lender_id`. NULL context (no session var set) = admin sees all. (20 sec)
3. **[T-SQL]** Create security policy `dbo.LenderSecurityPolicy` on `loan_applications` with FILTER predicate (15 sec)
4. **[T-SQL]** Demo the filtering (30 sec):
   - `EXEC sp_set_session_context @key=N'lender_id', @value=N'LND0000004';`
     → SELECT → 120 rows (LenderAlpha's view)
   - `EXEC sp_set_session_context @key=N'lender_id', @value=N'LND0000002';`
     → SELECT → 78 rows (LenderBeta's view)
   - `EXEC sp_set_session_context @key=N'lender_id', @value=NULL;`
     → SELECT → 300 rows (admin view)
   - Talk track: "This is exactly how production apps do it. Your API sets session context on each connection, and the database enforces the boundary. No WHERE clauses in app code. No risk of data leaks."

#### Part B: Auditing — NEW FEATURE (3:45–5:00)
Auditing is a new preview feature in SQL database in Fabric. Logs go to OneLake (immutable, free). Configured via the Fabric portal GUI.

1. **[Portal]** Navigate to database → Security tab → Manage SQL Auditing (20 sec)
   - Show the "Save Events to SQL Audit Logs" toggle (should be enabled)
   - Show preconfigured audit scenarios: "Audit everything" (default), "Permission Changes & Login Attempts", "Data Reads and Writes", "Schema Changes"
   - Show predicate expression option — "filter out noise for high-volume databases"
   - Talk track: "Auditing is built into SQL database in Fabric. Turn it on, pick what you want to capture — or just audit everything. Logs are immutable in OneLake."
2. **[T-SQL]** Query recent audit logs — show events from the RLS setup we just did (30 sec)
   ```sql
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
   ```
   - Should capture: CREATE TABLE (LenderAccessMap), CREATE FUNCTION, CREATE SECURITY POLICY, and SELECT statements
   - Talk track: "Every schema change, every permission modification, every data access — captured automatically and stored immutably in OneLake. For financial services, healthcare, any regulated industry — this is table stakes. And it's included at no extra cost."
3. **[T-SQL]** Time-range query for targeted investigation (optional, if time permits) (15 sec)
   ```sql
   -- Show only events from the last 10 minutes (our demo window)
   DECLARE @start NVARCHAR(30) = CONVERT(NVARCHAR(30), DATEADD(MINUTE, -10, SYSUTCDATETIME()), 127);
   DECLARE @end NVARCHAR(30) = CONVERT(NVARCHAR(30), SYSUTCDATETIME(), 127);
   SELECT event_time, action_id, server_principal_name, [statement]
   FROM sys.fn_get_audit_file_v2(
       'https://onelake.blob.fabric.microsoft.com/9f55fcab-c5a1-4341-bc95-8fcf8bdb88de/b3d2335b-659d-405a-805c-789a33eae5fe/Audit/sqldbauditlogs/',
       DEFAULT, DEFAULT, @start, @end)
   ORDER BY event_time DESC;
   ```

**Transition**: "Autonomous performance, enterprise security with a full audit trail — and it's all SaaS. But what if you need control?"

---

### Pillar 3 — SAAS BY DEFAULT, PAAS CONFIGURABLE (5:00–7:00)
**Message**: "Zero config to start, full control when you need it."

#### Part A: PaaS Configuration (5:00–5:40)
1. **[T-SQL]** Show database-scoped configurations (15 sec)
   - `SELECT * FROM sys.database_scoped_configurations`
   - "All set to optimal defaults — but fully overridable"
2. **[T-SQL]** MAXDOP example: set to 4, then revert to 0 (15 sec)
3. **[T-SQL + Portal]** **NEW FEATURE: vCore Capping** (~60 sec total, split across demo)
   - **Before (at 16 vcores)**: Run CPU-heavy cross-join query → note execution time in Performance Dashboard
   - **[Portal]** Change vcore cap to 4 in Fabric portal GUI (Settings → Performance)
   - **After (at 4 vcores)**: Re-run same query → show slower execution time
   - **[Portal]** Reset cap back to 16
   - Talk track: "Same query, same data — but now you control the compute ceiling. Balance cost and performance per-database."
   - CPU-heavy query uses cross-joins on existing tables to amplify to ~18M+ computed rows with HASHBYTES + string ops

#### Part B: Copilot (5:40–6:40)
1. **[Portal]** Open Copilot in Fabric portal (10 sec)
2. **[Portal]** Natural language questions against actual data (40 sec):
   - "Show me the top 10 borrowers by total requested loan amount with their risk tier"
   - "What's the approval rate by application channel?"
   - "Which borrowers have a thin credit file but an approved loan application?"
3. **[T-SQL]** Backup query if Copilot hiccups — top borrowers by total requested amount (10 sec)

#### Wrap-Up (6:40–7:00)
- "SQL database in Fabric: autonomous performance, enterprise security, SaaS simplicity with PaaS control when you need it."
- Hand off to demoer #3

---

## Files to Create/Modify

### Setup Scripts (minimal — data already exists)
- **setup/01-create-schema.sql** — REWRITE: Only creates supplementary objects: `dbo.LenderAccessMap` table. Validates existing tables are present. NO new schema, NO new core tables.
- **setup/02-seed-data.sql** — REWRITE: Only seeds `LenderAccessMap` with user→lender_id mappings. Queries existing `loan_applications` to find distinct `lender_id` values to use.

### Demo Scripts (consolidate from 5 → 3 files)
- **demo/pillar-1-autonomous.sql** — NEW: Performance observability + autonomous tuning queries against existing dbo tables
- **demo/pillar-2-enterprise-security.sql** — NEW: RLS on `loan_applications` by lender_id via SESSION_CONTEXT, auditing via GUI + T-SQL
- **demo/pillar-3-saas-paas.sql** — NEW: Database config, vcore capping with CPU-heavy query, Copilot prompts

### Cleanup
- **cleanup/reset-demo.sql** — REWRITE: Removes ONLY what we add:
  1. Drop security policy `LenderSecurityPolicy`
  2. Drop function `fn_LenderFilter`
  3. Drop `LenderAccessMap` table
  4. Clear session context
  5. Reset MAXDOP to 0
  - **Does NOT touch** borrowers, loan_applications, credit_scores, income_verifications, collaterals

### Documentation
- **README.md** — REWRITE: Updated 3-pillar structure, timing, tab order, backup plans, pre-demo checklist

### Files to Delete
- demo/segment-1-auto-performance.sql
- demo/segment-2-graphql-api.sql
- demo/segment-3-autonomous-tuning.sql
- demo/segment-4-enterprise-security.sql
- demo/segment-5-paas-copilot.sql

---

## Implementation Steps

### Phase 1: Setup Scripts
1. Rewrite `setup/01-create-schema.sql` — create only `LenderAccessMap` + validate existing tables
2. Rewrite `setup/02-seed-data.sql` — seed `LenderAccessMap` with lender_id mappings from existing data
   - *Parallel with step 1*

### Phase 2: Demo Scripts (all parallel, depend on Phase 1 for object names)
3. Create `demo/pillar-1-autonomous.sql` — DMV queries + workload + auto-tuning against dbo tables
4. Create `demo/pillar-2-enterprise-security.sql` — RLS by lender_id via SESSION_CONTEXT, auditing via GUI + fn_get_audit_file_v2
5. Create `demo/pillar-3-saas-paas.sql` — config, vcore cap with CPU query, Copilot prompts

### Phase 3: Cleanup & Docs (depend on Phase 2)
6. Rewrite `cleanup/reset-demo.sql` — clean removal of only added objects
7. Rewrite `README.md` — updated structure and checklist
8. Delete 5 old segment files
   - *Parallel with steps 6 & 7*

---

## Verification
1. **Pre-flight check**: Run setup scripts — `LenderAccessMap` created, existing tables untouched (row counts unchanged)
2. **Demo dry run**: Execute each pillar script — no syntax errors, meaningful output
3. **RLS test**: Set session context to `LND0000004` → 120 rows; `LND0000002` → 78 rows; NULL → 300 rows
4. **Audit test**: Query `sys.fn_get_audit_file_v2` — see CREATE TABLE, CREATE FUNCTION, CREATE SECURITY POLICY events
5. **Cleanup test**: Run `reset-demo.sql` → all added objects removed, 5 original tables intact with original row counts
6. **Idempotent reset**: Run setup → demo → cleanup → setup cycle twice — no errors
7. **Timing rehearsal**: Full run-through with portal steps, confirm ≤ 7 minutes

---

## Decisions
- **Use existing dbo tables** — no new schema or seed data; demo queries existing borrowers, loan_applications, credit_scores, income_verifications, collaterals
- **RLS by lender_id via SESSION_CONTEXT** — `EXECUTE AS` not supported on Fabric; SESSION_CONTEXT is how real multi-tenant apps do it
- **DDM dropped** — `WITHOUT LOGIN` and `EXECUTE AS` not supported on Fabric; can't demo masking without a second user session
- **Auditing expanded** — new preview feature, GUI + T-SQL demo, replaces DDM time allocation
- **Cleanup is non-destructive** — only removes objects we create; demoer #3's tables are untouched
- **GraphQL dropped** — demoer #1 covers developer features
- **OneLake dropped** — demoer #3 covers Fabric integration
- **vCore capping** — GUI in Fabric portal; CPU-heavy cross-join query for before/after comparison

## Further Considerations
1. **Nested `sqlcon-atl-demo/` folder**: Workspace has duplicate empty subfolders — recommend deleting.
2. **RLS applied live**: RLS objects created live during demo (it's the centerpiece), with all T-SQL pre-written in the script file for reliability.
3. **Tab order for demo day**: (1) Fabric Portal - Performance Dashboard, (2) pillar-1-autonomous.sql, (3) pillar-2-enterprise-security.sql, (4) pillar-3-saas-paas.sql, (5) Fabric Portal - Copilot — 5 tabs total.
4. **lender_id values confirmed**:
   - LenderAlpha → `LND0000004` (120 applications)
   - LenderBeta → `LND0000002` (78 applications)
   - Clear count difference makes RLS filtering visually obvious on stage
5. **Workspace & Database IDs** (for audit log queries):
   - Workspace: `9f55fcab-c5a1-4341-bc95-8fcf8bdb88de`
   - Database: `b3d2335b-659d-405a-805c-789a33eae5fe`

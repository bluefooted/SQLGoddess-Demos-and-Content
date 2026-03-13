# SQL database in Fabric — FabCon Demo

## Demo Story

**You are Presenter #2 of 3.** The previous presenter has already:
- Created the SQL database (`LoanApplicationApp`)
- Shown GitHub integration & developer features
- Populated the 5 core tables (borrowers, loan_applications, credit_scores, income_verifications, collaterals)

**Your angle:** SQL database in Fabric is **autonomous, enterprise-ready, and SaaS by default with PaaS control.**

**After you:** Presenter #3 will shortcut the existing dbo tables into a Lakehouse, show pipelines, and data agents.

**Critical constraint:** Do NOT modify or drop the 5 existing dbo tables. Your demo is read-only + portal GUI.

---

## 7-Minute Run Sheet

| Time | Pillar | Script / Action | Key Moment |
|------|--------|-----------------|------------|
| 0:00–0:30 | **1. Autonomous** | [Portal] Performance Dashboard | "Always on — zero configuration" |
| 0:30–1:15 | | `pillar-1-autonomous.sql` — DMVs, Query Store | "Query Store is always on, always capturing" |
| 1:15–2:30 | | `pillar-1-autonomous.sql` — Workload + auto-tuning | Run 4 query patterns → show index recs, auto-tuning |
| 2:30–3:30 | **2. Enterprise Ready** | [Portal] Security → Manage SQL Auditing | **NEW**: Enable auditing, show scenarios, retention |
| 3:30–3:50 | | `pillar-2-enterprise-security.sql` — Generate activity | Run sample queries to create audit events |
| 3:50–4:45 | | `pillar-2-enterprise-security.sql` — Query audit logs | `fn_get_audit_file_v2` — all events + time-range |
| 4:45–5:00 | | Talk track | Compliance story (HIPAA, SOX, regulated industries) |
| 5:00–5:20 | **3. SaaS/PaaS** | `pillar-3-saas-paas.sql` — CPU query at 32 vCores | Baseline execution time |
| 5:20–5:50 | | [Portal] Settings → Compute → Cap to 4 vCores | **NEW**: Max vCore limit dropdown |
| 5:50–6:10 | | `pillar-3-saas-paas.sql` — CPU query at 4 vCores | Show slower execution, reset to 32 |
| 6:15–6:40 | | [Portal] Copilot | Natural language → SQL on loan data |
| 6:40–7:00 | | Wrap-up & handoff | → Presenter #3 |

---

## Project Structure

```
sqlcon-atl-demo/
├── README.md                                ← You are here
├── setup/
│   └── 01-create-schema.sql                 ← Pre-flight validation (no objects created)
├── demo/
│   ├── pillar-1-autonomous.sql              ← Pillar 1: Performance + Auto-Tuning
│   ├── pillar-2-enterprise-security.sql     ← Pillar 2: Auditing (NEW)
│   └── pillar-3-saas-paas.sql              ← Pillar 3: vCore Capping (NEW) + Copilot
└── cleanup/
    └── reset-demo.sql                       ← Reset vCore cap + verify tables intact
```

---

## Pre-Demo Setup

1. **Confirm the database exists** — Presenter #1 will have created `LoanApplicationApp`
2. **Run the validation script:**
   ```
   setup/01-create-schema.sql
   ```
   Verify all 5 tables present with expected row counts.

3. **Enable Auditing ahead of time** (recommended):
   - Security tab → Manage SQL Auditing → Enable → Audit everything → Save
   - This ensures audit logs are flowing before you go on stage
   - On stage, you'll show the GUI configuration and query logs that captured Pillar 1 activity

4. **Verify vCore cap is at default:**
   - Settings → Compute (preview) → should show "32 vCores (default)"

5. **Pre-open tabs in order:**

   | Tab # | What | Where |
   |-------|------|-------|
   | 1 | Performance Dashboard | Fabric Portal |
   | 2 | `pillar-1-autonomous.sql` | VS Code / SQL Editor |
   | 3 | Security → Auditing | Fabric Portal |
   | 4 | `pillar-2-enterprise-security.sql` | VS Code / SQL Editor |
   | 5 | `pillar-3-saas-paas.sql` | VS Code / SQL Editor |
   | 6 | Copilot | Fabric Portal |

---

## Presenter Script & Transitions

### Opening (0:00)
> *"Thanks [Presenter 1]! You just saw how easy it is to get started with SQL database in Fabric. Now let me show you what happens when you put this database to work in production — autonomous performance, enterprise-grade compliance, and control when you need it."*

### Pillar 1 → 2 Transition (~2:30)
> *"Performance takes care of itself. Now let's talk about what enterprises need most — compliance and security."*

### Pillar 2 → 3 Transition (~5:00)
> *"Autonomous performance, a full enterprise audit trail — and it's all SaaS. But what if you need control?"*

### Closing (~6:40)
> *"SQL database in Fabric: autonomous performance, enterprise security, SaaS simplicity with PaaS control when you need it."*

---

## Backup Plans

| Risk | Mitigation |
|------|-----------|
| Audit logs not yet available | Mention "there can be a short lag" — this is why we pre-enable auditing. Logs from Pillar 1 workload queries should be there by the time you reach Pillar 2. |
| Audit `fn_get_audit_file_v2` fails | Show the audit config GUI only and say "logs are queryable via T-SQL and directly in OneLake" |
| vCore cap change takes time to apply | Pre-set to 4 vCores before demo, run query, then set to 32 and re-run (reverse the order) |
| Copilot doesn't generate a query | Backup query is in `pillar-3-saas-paas.sql` |
| Auto index recs don't appear | Run workload 10x instead of 5x; or say "in production workloads these appear within minutes" |
| Portal is slow | Stay in T-SQL editor for all possible steps |

---

## Reset for Re-Run

```
cleanup/reset-demo.sql
```

This verifies the 5 existing tables are intact and reminds you to reset the vCore cap to 32 in the portal. No database objects to drop — the demo is entirely read-only.

## 📋 Tab Order for Demo Day

| Tab # | What | Where |
|-------|------|-------|
| 1 | `segment-1-auto-performance.sql` | VS Code |
| 2 | `segment-3-autonomous-tuning.sql` | VS Code |
| 3 | `segment-2-graphql-api.sql` | VS Code |
| 4 | `segment-4-enterprise-security.sql` | VS Code |
| 5 | `segment-5-paas-copilot.sql` | VS Code |
| 6 | Fabric Portal — SQL database | Browser |
| 7 | Fabric Portal — GraphQL API explorer | Browser |
| 8 | Fabric Portal — OneLake data hub | Browser |

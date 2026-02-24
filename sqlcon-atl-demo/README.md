# SQL database in Fabric — SQL Con ATL Demo

## 🎯 Demo Story

**You are Presenter #2 of 3.** The previous presenter has already:
- Created the SQL database in Fabric
- Shown VS Code integration & source control
- Demonstrated the getting-started experience

**Your angle:** Show the audience that SQL database in Fabric is **autonomous, enterprise-ready, SaaS by default, and PaaS configurable.**

---

## ⏱️ Revised 7-Minute Run Sheet

| Time | Segment | Script | Theme | Key Moment |
|------|---------|--------|-------|------------|
| 0:00–1:30 | **1. Performance Observability** | `segment-1-auto-performance.sql` | Autonomous | Performance Dashboard, DMVs, Query Store, wait stats — all built in |
| 1:30–3:00 | **2. Autonomous Tuning** | `segment-3-autonomous-tuning.sql` | Autonomous | Workload patterns → auto index recs, IQP, auto-tuning ON |
| 3:00–4:30 | **3. GraphQL API Endpoint** | `segment-2-graphql-api.sql` | SaaS by default | Generate API in portal, run GraphQL query live |
| 4:30–6:00 | **4. Enterprise Security** | `segment-4-enterprise-security.sql` | Enterprise-ready | DDM, RLS, auditing — all in 90 seconds |
| 6:00–7:00 | **5. PaaS Config, Copilot & Fabric Integration** | `segment-5-paas-copilot.sql` | PaaS configurable | Copilot NL→SQL, OneLake auto-mirroring |

---

## 📁 Project Structure

```
sqlcon-atl-demo/
├── README.md                              ← You are here
├── setup/
│   ├── 01-create-schema.sql               ← Run BEFORE demo (creates tables)
│   └── 02-seed-data.sql                   ← Run BEFORE demo (10K orders)
├── demo/
│   ├── segment-1-auto-performance.sql     ← Segment 1: Observability
│   ├── segment-2-graphql-api.sql          ← Segment 3: GraphQL API
│   ├── segment-3-autonomous-tuning.sql    ← Segment 2: Autonomous Tuning
│   ├── segment-4-enterprise-security.sql  ← Segment 4
│   └── segment-5-paas-copilot.sql         ← Segment 5
└── cleanup/
    └── reset-demo.sql                     ← Tear down & reset for re-run
```

---

## 🔧 Pre-Demo Setup (Day Before)

1. **Confirm the database exists** — the prior presenter will have created it
2. **Run setup scripts in order:**
   ```
   setup/01-create-schema.sql
   setup/02-seed-data.sql
   ```
3. **Verify data loaded:**
   ```sql
   SELECT COUNT(*) FROM retail.Orders;        -- expect ~10,000
   SELECT COUNT(*) FROM retail.OrderItems;     -- expect ~25,000
   SELECT COUNT(*) FROM retail.Customers;      -- expect 500
   SELECT COUNT(*) FROM retail.Products;       -- expect 80
   ```
4. **Pre-create the GraphQL API** in the Fabric portal (Segment 3):
   - Run the view/proc creation from `segment-2-graphql-api.sql`
   - Go to the portal → New → GraphQL API → select tables + view + stored proc
   - Verify it works with the test queries in the script
   - *You'll walk through this live but having it pre-created avoids portal latency*
5. **Open all 5 demo scripts** in VS Code tabs, in order
6. **Open the Fabric portal** in a browser tab, logged in
7. **Open a second browser tab** to the GraphQL API explorer

---

## 🎤 Presenter Script & Transitions

### Opening (at 0:00)
> *"Thanks [Presenter 1]! You just saw how easy it is to get started. Now let me show you what happens when you actually PUT this database to work — observability, autonomous tuning, instant APIs, security, and intelligence, all built in."*

### Segment 1 → 2 Transition (at ~1:30)
> *"Full observability — Performance Dashboard, DMVs, Query Store, wait stats — all built in, always on. But does it just monitor, or does it actually ACT on what it sees? Let me show you..."*

### Segment 2 → 3 Transition (at ~3:00)
> *"The database monitors itself AND tunes itself. Now let me show you something that gets a lot of applause — an instant API on your data."*

### Segment 3 → 4 Transition (at ~4:30)
> *"An instant GraphQL API — no Express, no Django, no deployment pipeline. That's SaaS by default. Now let me show you enterprise-grade security in under 90 seconds."*

### Segment 4 → 5 Transition (at ~6:00)
> *"Dynamic Data Masking, Row-Level Security, and auditing — all in under 90 seconds. For our finale, let me show you the PaaS flexibility and Copilot."*

### Closing (at ~6:50)
> *"SQL database in Fabric — full observability, autonomous tuning, instant APIs, enterprise security, PaaS control when you need it, Copilot built in, and automatic OneLake integration. SaaS by default. PaaS when you want it. Thank you!"*

---

## ⚠️ Backup Plans

| Risk | Mitigation |
|------|-----------|
| GraphQL API takes too long to create | Pre-create it; just show & query it |
| Copilot doesn't generate a query | Backup queries are in `segment-5-paas-copilot.sql` |
| Automatic index recs don't appear | Run the workload queries 10x instead of 5x in segment 2; or mention "in production workloads these appear within minutes" |
| Audit log query fails | Skip it — just mention "auditing is on by default" and move on |
| Portal is slow | Stay in VS Code / SQL editor for all possible segments |

---

## 🧹 Reset for Re-Run

If you need to reset the demo to run it again:
```
cleanup/reset-demo.sql
setup/01-create-schema.sql
setup/02-seed-data.sql
```

---

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

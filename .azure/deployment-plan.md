# Pawfect Match RAG Deployment Plan

**Status:** Fabric app and SQL/RAG objects deployed; live embedding, indexing, and semantic matching validated
**Mode:** Modify existing application
**Application:** `pawfect-match`
**Subscription:** `61868ab8-16d4-44ec-a9ff-f35d05922847`
**Region:** East US
**Deployment recipe:** Rayfin static app + Rayfin Functions + SQL database in Fabric

## Goal

Use SQL-native Azure OpenAI embeddings and vector search in the existing Fabric SQL database, invoked by a Fabric-hosted Rayfin function with delegated user authentication. Keep the browser fallback until the function path is live.

## Existing Resources

- Azure AI Services account: `ai-pamdemoaihub880628764654`
- Azure OpenAI endpoint: `https://ai-pamdemoaihub880628764654.openai.azure.com/`
- Embedding deployment: `text-embedding-3-small` (1,536 dimensions)
- Chat deployment: `gpt-4o`
- Existing Rayfin-managed Fabric SQL Database and static Fabric App

## Architecture

1. Keep the React/Vite application static and free of service credentials.
2. Register `text-embedding-3-small` with `CREATE EXTERNAL MODEL` in SQL database in Fabric.
3. Use `AI_GENERATE_EMBEDDINGS` to index pet profiles and care notes into `VECTOR(1536)` values.
4. Execute `dbo.MatchPetsByLifestyle` from a Rayfin function using a delegated `AudienceType.Sql` token.
5. Let Fabric SQL invoke Azure OpenAI through an encrypted database-scoped credential containing an account API key.
6. Invoke the function through the existing authenticated `RayfinClient`; no separate Entra application is required.
7. Preserve deterministic matching fallback until the deployed function validates successfully.

## Azure Services

- Existing Azure AI Services account.
- Existing SQL database in Fabric.
- Rayfin Functions hosted by the existing Fabric app backend.

No Azure Function, Storage account, App Service, client secret, Azure OpenAI deployment, or SQL database is required.

## Security

- Declare the Rayfin function's SQL connection with `AudienceType.Sql` so the runtime exchanges the caller identity for a SQL token.
- Grant the signed-in user appropriate database permissions for the matching and indexing procedures.
- Store the Azure OpenAI API key only in an encrypted database-scoped credential. Never place it in source, frontend settings, command output, or tracked local files.
- Keep all SQL calls parameterized and expose only the typed `matchPets` function to the frontend.

## Configuration

No new production frontend settings are required. Rayfin routes production function calls through the existing app backend. `VITE_RAYFIN_FUNCTIONS_URL` is only used by the local function host.

## Implementation Steps

1. Create the database master key and Azure OpenAI database-scoped credential through a secure administrative session.
2. Apply `pawfect-match/rayfin/sql/vector-rag.sql`, load the demo entities, and execute `dbo.IndexPetKnowledge`.
3. Build and test `rayfin/functions`, including the delegated SQL connection declaration.
4. Deploy the Rayfin function and static app with the existing Rayfin workflow.
5. Validate the live matching workflow under Fabric SSO.
6. Remove the obsolete Azure Function/IaC implementation only after the Rayfin function succeeds.

## Validation Gates

- Embedding response contains exactly 1,536 values.
- Retrieved sources belong only to available pets satisfying hard filters.
- Every generated recommendation contains at least one retrieved citation.
- No model-generated pet facts are accepted unless present in retrieved evidence or structured SQL fields.
- Browser fallback remains functional with the API stopped.
- No secrets are present in frontend artifacts or tracked local settings.
- Azure preflight validation is required before any deployment.

## Cost and Scale

This is a demo workload. Azure OpenAI usage is token based, and the existing Fabric capacity and SQL database are reused. Initial limits will favor low concurrency, small retrieval sets, and batched indexing. No paid Azure compute resources are required by this architecture.

## Deployment Boundary

The Fabric app and Rayfin entity schema were deployed on August 27, 2026. The SQL external model, vector table, and matching procedures were applied on August 28, 2026. Live embedding and indexed-data validation now pass. The historical Azure Function must remain undeployed; only the Rayfin function and static app belong in the next deployment.

## Implementation Results

- Companion API strict TypeScript build: passed.
- Companion API tests: 3 passed.
- Frontend tests: 2 passed.
- Frontend lint: 0 errors; one pre-existing Fast Refresh warning.
- Frontend production build: passed.
- Fabric deployment: passed; Rayfin database configuration version 4 and static deployment `deploy-20260827230427-b99ae6a5` are live.
- Fabric hosting URL: `https://lacy-olive-89bd8b2dab-westcentralus.webapp.msit.fabricapps.net`.
- Rayfin deployment status: endpoint reachable; auth and data services enabled.
- Azure AI RBAC: `Cognitive Services OpenAI User` is assigned to `pamela@microsoft.com` at the Azure AI Services account scope.
- Fabric SQL objects: `PawfectEmbeddingModel`, `dbo.PetKnowledgeChunk`, `dbo.IndexPetKnowledge`, `dbo.SearchPetKnowledge`, and `dbo.MatchPetsByLifestyle` deployed successfully.
- Live schema correction: Rayfin deployed plural table names (`dbo.Pets`, `dbo.Shelters`, and `dbo.CareNotes`); the SQL script now targets those names.
- Azure OpenAI credential: encrypted database-scoped credential created and explicitly bound to `PawfectEmbeddingModel`; no key was written to source or local files.
- Live embedding request: passed with a 1,536-dimension vector.
- Live entity data: 3 shelters, 6 pets, and 7 care notes loaded; 5 pets are available.
- Live vector index: `dbo.IndexPetKnowledge` passed and produced 13 chunks.
- Live semantic match: passed for `Quiet apartment home with children`; Pepper, Luna, and Milo were returned with source citations.

## Remaining Deployment Steps

1. Deploy the Rayfin function and refreshed static frontend.
2. Validate the live authenticated matching workflow in the browser.

## All Validation Checks Pass

- [x] 1. AZD Installation
- [x] 2. Schema Validation
- [ ] 3. Environment Setup
- [ ] 4. Authentication Check
- [ ] 5. Subscription/Location Check
- [ ] 6. Aspire Pre-Provisioning Checks (not applicable)
- [ ] 7. Provision Preview
- [x] 8. Build Verification
- [x] 9. Docker Build Context Validation (not applicable)
- [ ] 10. Package Validation
- [ ] 11. Azure Policy Validation
- [x] 12. Aspire Post-Provisioning Checks (not applicable)

## Section 7: Validation Proof

| Check | Command or tool | Result |
| --- | --- | --- |
| API dependencies | `npm install` in `pawfect-match/api` | Passed; 140 packages, 0 vulnerabilities |
| API compile | `npm run api:build` | Passed; no TypeScript diagnostics |
| API tests | `npm run api:test` | Passed; 3 tests |
| Frontend tests | `npm run test` | Passed; 2 tests |
| Frontend lint | `npm run lint` | Passed with 0 errors and one pre-existing Fast Refresh warning |
| Frontend production build | `npm run build` | Passed; Vite transformed 1,892 modules |
| Live embedding | `AI_GENERATE_EMBEDDINGS` using `PawfectEmbeddingModel` | Passed; returned a 1,536-dimension vector through the encrypted database-scoped credential |
| Azure AI RBAC | `role_assignment_list` at account scope | Passed; `Cognitive Services OpenAI User` assigned to Pamela's user object |
| Fabric SQL RAG objects | `CREATE EXTERNAL MODEL`, vector table, and three procedures | Passed; all objects created against the live plural Rayfin tables |
| Live RAG source data | Row counts for `dbo.Shelters`, `dbo.Pets`, and `dbo.CareNotes` | Passed; 3 shelters, 6 pets, and 7 care notes |
| Live vector index | `EXEC dbo.IndexPetKnowledge` and chunk count | Passed; 13 chunks indexed |
| Live semantic match | `EXEC dbo.MatchPetsByLifestyle` | Passed; three ranked pets returned with citations |
| AZD installation | `azd version` | Passed; Azure Developer CLI 1.32.0 installed |
| AZD schema | `azd show` | Passed; project and `api` service recognized |
| Obsolete Function infrastructure | `az bicep build --file infra/main.bicep` | Historical validation passed; this infrastructure must not be deployed |
| Fabric SQL discovery | Fabric REST plus read-only Entra SQL metadata query | Passed; endpoint/database confirmed |
| Fabric deployment | `rayfin up` | Passed; seven entities applied as database configuration version 4 and static content deployed |
| Fabric status | `rayfin up status` plus browser check | Passed; endpoint reachable and production auth page rendered |

# Pawfect Match

Pawfect Match is a Fabric App for animal shelters. It combines structured compatibility filters with semantic retrieval over pet bios, foster notes, behavior assessments, and care guides. Match results explain positive signals, tradeoffs, and the source evidence used.

## Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Local matching uses a deterministic semantic fallback and labels the result accordingly. This keeps the workflow demoable before an embedding endpoint is configured.

## Fabric SQL data model

Rayfin entities in `rayfin/data` provision the operational schema:

- `Shelter` and `Pet` store inventory, compatibility traits, status, and recommendation activity.
- `PetProfile` stores routine, ideal-home, medical, and training details.
- `AdopterProfile` stores the user's original lifestyle text and extracted preferences.
- `CareNote` stores citable foster, behavior, and care evidence.
- `AdoptionApplication` records funnel status and the match score at submission.

Adopter profiles and applications use user-level row security. The starter `Todo` remains registered to avoid an automatic destructive migration; remove it only in a separately reviewed `rayfin up --force` deployment.

## Vector RAG

Rayfin 1.34 does not expose a vector decorator or similarity-query API. Operational CRUD stays on the typed Rayfin client, while vector retrieval uses `rayfin/sql/vector-rag.sql`.

1. Split pet bios and care notes into source-attributed chunks.
2. Generate embeddings in Fabric SQL with `AI_GENERATE_EMBEDDINGS` and write them to `dbo.PetKnowledgeChunk`.
3. Extract hard constraints from the adopter's text and filter available pets in SQL.
4. Rank evidence with `VECTOR_DISTANCE('cosine', ...)` in `dbo.SearchPetKnowledge`.
5. Return retrieved pet details and source citations through the typed Rayfin `matchPets` function.

The Fabric-hosted function lives in `rayfin/functions`. It obtains a delegated Fabric SQL token with `AudienceType.Sql` and executes `dbo.MatchPetsByLifestyle`. SQL calls the existing `text-embedding-3-small` deployment through an encrypted database-scoped credential and stores 1,536-dimensional vectors. The historical implementation in `api/` and `infra/` is retained for reference and must not be deployed.

The function accepts:

```json
{ "lifestyleText": "I live in an apartment and want a calm family dog." }
```

It returns the `MatchResponse` shape from `src/services/matching.ts` with `mode` set to `fabric-ai`. If the function is unavailable, the UI returns to the labeled demo matcher. Never put the Azure OpenAI key or SQL credentials in Vite variables or tracked files.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Apply Rayfin services and start Vite |
| `npm run test` | Run Vitest tests |
| `npm run lint` | Run ESLint |
| `npm --prefix rayfin/functions run build` | Compile the Rayfin function |
| `npm run build:fabric` | Compile the production frontend |
| `npx rayfin up` | Deploy schema and static app to Fabric |
| `npx rayfin up status` | Verify deployment health |

Apply the vector SQL artifact separately to Fabric SQL using a database deployment identity. Create its database master key and encrypted Azure OpenAI credential through a secure administrative session before applying the script. Run tests and the production builds before deploying the app.
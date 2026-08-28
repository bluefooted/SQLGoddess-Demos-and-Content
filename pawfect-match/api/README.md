# Pawfect Match RAG API

This Azure Functions companion keeps Azure OpenAI and Fabric SQL access on the server. It uses `DefaultAzureCredential`: local development uses your Azure CLI identity, while Azure uses the Function App managed identity.

## Models

- Endpoint: `https://ai-pamdemoaihub880628764654.openai.azure.com/`
- Embeddings: `text-embedding-3-small` with 1,536 dimensions
- Grounded explanations: `gpt-4o`

## Local setup

1. Copy `local.settings.example.json` to `local.settings.json`.
2. The example already contains the confirmed Pawfect Match Fabric SQL server and physical database name.
3. Sign in with `az login` using an identity that can invoke both model deployments and connect to Fabric SQL.
4. Start Azurite, then run `npm install` and `npm start` in this directory.
5. Set `VITE_MATCH_API_URL=http://localhost:7071/api/match` in the frontend's local environment.

No Azure OpenAI key or SQL password is required or supported.

## Routes

### `POST /api/match`

The production host must require an authenticated caller. The local Functions route is anonymous so Vite can call it without carrying a secret.

```json
{
  "lifestyleText": "I live in an apartment with two kids and want a calm dog."
}
```

The route extracts hard filters, embeds the text, executes `dbo.SearchPetKnowledge`, and asks `gpt-4o` for schema-constrained explanations based only on retrieved rows.

### `POST /api/index`

This route uses Functions `function` authorization and accepts up to 100 attributed sources per request:

```json
{
  "sources": [
    {
      "id": "<care-note-uuid>",
      "petId": "<pet-uuid>",
      "sourceType": "Foster note",
      "sourceLabel": "Foster diary - Aug 18",
      "text": "Luna settles quietly beside a desk during calls."
    }
  ]
}
```

Each source must already be bounded to 3,000 characters. Reusing its UUID updates the existing vector row.

## Managed identity permissions

Assign `Cognitive Services OpenAI User` to the Function identity on the existing AI Services account. In Fabric SQL, connect as a database administrator and grant only the required data-plane permissions:

```sql
CREATE USER [<function-app-name>] FROM EXTERNAL PROVIDER;
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.PetKnowledgeChunk TO [<function-app-name>];
GRANT EXECUTE ON OBJECT::dbo.SearchPetKnowledge TO [<function-app-name>];
```

Configure platform authentication for the deployed `/api/match` route and restrict CORS to the deployed Fabric App origin. Do not log lifestyle text, evidence content, tokens, or authorization headers.
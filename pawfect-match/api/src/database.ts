import { DefaultAzureCredential } from '@azure/identity';
import sql from 'mssql';

import type { ApiConfig } from './config';
import type { KnowledgeRow, KnowledgeSource, Preferences } from './types';

const credential = new DefaultAzureCredential();

export async function searchKnowledge(
  config: ApiConfig,
  embedding: number[],
  preferences: Preferences,
): Promise<KnowledgeRow[]> {
  validateEmbedding(embedding);
  const pool = await connect(config);
  try {
    const result = await pool.request()
      .input('embedding', sql.NVarChar(sql.MAX), JSON.stringify(embedding))
      .input('species', sql.NVarChar(60), preferences.species ?? null)
      .input('goodWithKids', sql.Bit, preferences.goodWithKids ?? null)
      .input('energyLevel', sql.NVarChar(40), preferences.energyLevel ?? null)
      .query(`
        DECLARE @vector VECTOR(1536) = CAST(@embedding AS VECTOR(1536));
        EXEC dbo.SearchPetKnowledge
          @query_embedding = @vector,
          @species = @species,
          @good_with_kids = @goodWithKids,
          @energy_level = @energyLevel,
          @top = 12;
      `);
    return result.recordset.map(mapKnowledgeRow);
  } finally {
    await pool.close();
  }
}

export async function upsertKnowledge(
  config: ApiConfig,
  sources: KnowledgeSource[],
  embeddings: number[][],
): Promise<number> {
  embeddings.forEach(validateEmbedding);
  if (sources.length !== embeddings.length) {
    throw new Error('Each knowledge source must have exactly one embedding.');
  }
  const pool = await connect(config);
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
    for (const [index, source] of sources.entries()) {
      await new sql.Request(transaction)
        .input('id', sql.UniqueIdentifier, source.id)
        .input('petId', sql.UniqueIdentifier, source.petId)
        .input('sourceType', sql.NVarChar(60), source.sourceType)
        .input('sourceLabel', sql.NVarChar(200), source.sourceLabel)
        .input('chunkText', sql.NVarChar(3000), source.text)
        .input('embedding', sql.NVarChar(sql.MAX), JSON.stringify(embeddings[index]))
        .query(`
          MERGE dbo.PetKnowledgeChunk AS target
          USING (SELECT @id AS id) AS source ON target.id = source.id
          WHEN MATCHED THEN UPDATE SET
            pet_id = @petId,
            source_type = @sourceType,
            source_id = @id,
            source_label = @sourceLabel,
            chunk_text = @chunkText,
            embedding = CAST(@embedding AS VECTOR(1536)),
            created_at = SYSUTCDATETIME()
          WHEN NOT MATCHED THEN INSERT
            (id, pet_id, source_type, source_id, source_label, chunk_text, embedding)
          VALUES
            (@id, @petId, @sourceType, @id, @sourceLabel, @chunkText, CAST(@embedding AS VECTOR(1536)));
        `);
    }
    await transaction.commit();
    return sources.length;
  } catch (error) {
    await transaction.rollback();
    throw error;
  } finally {
    await pool.close();
  }
}

async function connect(config: ApiConfig): Promise<sql.ConnectionPool> {
  const token = await credential.getToken('https://database.windows.net/.default');
  if (!token) throw new Error('Unable to acquire a Fabric SQL access token.');
  return new sql.ConnectionPool({
    server: config.sqlServer,
    database: config.sqlDatabase,
    options: { encrypt: true, trustServerCertificate: false },
    authentication: {
      type: 'azure-active-directory-access-token',
      options: { token: token.token },
    },
    pool: { min: 0, max: 4, idleTimeoutMillis: 30_000 },
  }).connect();
}

function mapKnowledgeRow(row: Record<string, unknown>): KnowledgeRow {
  return {
    id: String(row.pet_id),
    shelterId: String(row.shelter_id),
    shelterName: String(row.shelter_name),
    name: String(row.pet_name),
    species: String(row.species),
    breed: String(row.breed),
    ageYears: Number(row.age_years),
    size: String(row.size),
    energyLevel: String(row.energy_level),
    temperament: String(row.temperament).split(',').map((value) => value.trim()).filter(Boolean),
    goodWithKids: Boolean(row.good_with_kids),
    goodWithOtherPets: Boolean(row.good_with_other_pets),
    housingNeeds: String(row.housing_needs),
    bio: String(row.bio),
    adoptionStatus: 'Available',
    recommendationCount: Number(row.recommendation_count),
    imageUrl: String(row.image_url ?? ''),
    sourceId: String(row.source_id),
    sourceType: String(row.source_type),
    sourceLabel: String(row.source_label),
    chunkText: String(row.chunk_text),
    similarity: Number(row.similarity),
  };
}

function validateEmbedding(embedding: number[]): void {
  if (embedding.length !== 1536 || embedding.some((value) => !Number.isFinite(value))) {
    throw new Error('Embeddings must contain exactly 1,536 finite numbers.');
  }
}
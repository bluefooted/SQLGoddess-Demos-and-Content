import { DefaultAzureCredential } from '@azure/identity';

import type { KnowledgeRow, Preferences } from './types';

const credential = new DefaultAzureCredential();
const apiVersion = '2024-10-21';

export async function createEmbeddings(
  endpoint: string,
  deployment: string,
  inputs: string[],
): Promise<number[][]> {
  const response = await invoke(endpoint, deployment, 'embeddings', {
    input: inputs,
    encoding_format: 'float',
  });
  const body = await response.json() as { data?: Array<{ embedding: number[]; index: number }> };
  const embeddings = [...(body.data ?? [])]
    .sort((left, right) => left.index - right.index)
    .map(({ embedding }) => embedding);

  if (embeddings.length !== inputs.length || embeddings.some((embedding) => embedding.length !== 1536)) {
    throw new Error('Azure OpenAI returned an unexpected embedding shape.');
  }
  return embeddings;
}

export async function generateExplanations(
  endpoint: string,
  deployment: string,
  lifestyleText: string,
  preferences: Preferences,
  rows: KnowledgeRow[],
): Promise<Map<string, { why: string[]; concerns: string[] }>> {
  const evidence = rows.map((row) => ({
    petId: row.id,
    petName: row.name,
    structured: {
      species: row.species,
      breed: row.breed,
      energyLevel: row.energyLevel,
      goodWithKids: row.goodWithKids,
      goodWithOtherPets: row.goodWithOtherPets,
      housingNeeds: row.housingNeeds,
      temperament: row.temperament,
    },
    source: { label: row.sourceLabel, text: row.chunkText },
  }));
  const response = await invoke(endpoint, deployment, 'chat/completions', {
    messages: [
      {
        role: 'system',
        content: 'You explain shelter pet matches. Use only supplied structured facts and evidence. Give concise, compassionate reasons and concrete tradeoffs. Never invent facts, sources, or medical advice.',
      },
      {
        role: 'user',
        content: JSON.stringify({ lifestyleText, preferences, evidence }),
      },
    ],
    temperature: 0.2,
    max_tokens: 900,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'pet_match_explanations',
        strict: true,
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['matches'],
          properties: {
            matches: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['petId', 'why', 'concerns'],
                properties: {
                  petId: { type: 'string' },
                  why: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 3 },
                  concerns: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 2 },
                },
              },
            },
          },
        },
      },
    },
  });
  const body = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = body.choices?.[0]?.message?.content;
  if (!content) throw new Error('Azure OpenAI did not return match explanations.');
  const parsed = parseExplanations(content);
  return new Map(parsed.matches.map((match) => [match.petId, match]));
}

function parseExplanations(content: string): {
  matches: Array<{ petId: string; why: string[]; concerns: string[] }>;
} {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('Azure OpenAI returned malformed explanation JSON.');
  }
  if (!parsed || typeof parsed !== 'object' || !Array.isArray((parsed as { matches?: unknown }).matches)) {
    throw new Error('Azure OpenAI returned an invalid explanation shape.');
  }
  const matches = (parsed as { matches: unknown[] }).matches;
  const valid = matches.every((item) => {
    if (!item || typeof item !== 'object') return false;
    const match = item as Record<string, unknown>;
    return typeof match.petId === 'string' &&
      Array.isArray(match.why) && match.why.every((value) => typeof value === 'string') &&
      Array.isArray(match.concerns) && match.concerns.every((value) => typeof value === 'string');
  });
  if (!valid) throw new Error('Azure OpenAI returned invalid match explanations.');
  return { matches: matches as Array<{ petId: string; why: string[]; concerns: string[] }> };
}

async function invoke(
  endpoint: string,
  deployment: string,
  operation: string,
  body: unknown,
): Promise<Response> {
  const token = await credential.getToken('https://cognitiveservices.azure.com/.default');
  if (!token) throw new Error('Unable to acquire an Azure OpenAI access token.');
  const url = `${endpoint}/openai/deployments/${encodeURIComponent(deployment)}/${operation}?api-version=${apiVersion}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    const requestId = response.headers.get('x-request-id') ?? 'unknown';
    throw new Error(`Azure OpenAI request failed (${response.status}, request ${requestId}).`);
  }
  return response;
}
import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';

import { createEmbeddings } from '../azureOpenAi';
import { getConfig } from '../config';
import { upsertKnowledge } from '../database';
import { handleError, jsonResponse } from '../http';
import type { KnowledgeSource } from '../types';

export async function indexKnowledge(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const config = getConfig();
  try {
    const body = await request.json() as { sources?: unknown };
    const sources = validateSources(body.sources);
    if (!sources) {
      return jsonResponse(request, config, 400, {
        error: 'sources must contain 1-100 attributed text records of at most 3,000 characters.',
      });
    }
    const embeddings = await createEmbeddings(
      config.openAiEndpoint,
      config.embeddingDeployment,
      sources.map(({ text }) => text),
    );
    const indexed = await upsertKnowledge(config, sources, embeddings);
    context.log('Knowledge indexing completed', { indexed });
    return jsonResponse(request, config, 200, { indexed });
  } catch (error) {
    return handleError(request, config, context, error);
  }
}

function validateSources(value: unknown): KnowledgeSource[] | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > 100) return null;
  const valid = value.every((source) => {
    if (!source || typeof source !== 'object') return false;
    const item = source as Record<string, unknown>;
    return ['id', 'petId', 'sourceType', 'sourceLabel', 'text'].every(
      (key) => typeof item[key] === 'string' && (item[key] as string).trim().length > 0,
    ) && (item.text as string).length <= 3000;
  });
  return valid ? value as KnowledgeSource[] : null;
}

app.http('indexKnowledge', {
  methods: ['POST'],
  authLevel: 'function',
  route: 'index',
  handler: indexKnowledge,
});
import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';

import { getConfig } from '../config';
import { handleError, jsonResponse } from '../http';
import { matchLifestyle } from '../rag';

export async function match(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const config = getConfig();
  if (request.method === 'OPTIONS') return jsonResponse(request, config, 204, null);
  try {
    const body = await request.json() as { lifestyleText?: unknown };
    const lifestyleText = typeof body.lifestyleText === 'string' ? body.lifestyleText.trim() : '';
    if (lifestyleText.length < 20 || lifestyleText.length > 3000) {
      return jsonResponse(request, config, 400, {
        error: 'lifestyleText must contain between 20 and 3,000 characters.',
      });
    }
    const result = await matchLifestyle(config, lifestyleText);
    context.log('RAG match completed', { resultCount: result.results.length });
    return jsonResponse(request, config, 200, result);
  } catch (error) {
    return handleError(request, config, context, error);
  }
}

app.http('match', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'match',
  handler: match,
});
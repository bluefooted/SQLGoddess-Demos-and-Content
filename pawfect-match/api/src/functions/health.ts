import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';

export async function health(
  _request: HttpRequest,
  _context: InvocationContext,
): Promise<HttpResponseInit> {
  return {
    jsonBody: {
      status: 'ready',
      service: 'pawfect-match-rag-api',
      authentication: 'managed-identity',
    },
  };
}

app.http('health', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'health',
  handler: health,
});
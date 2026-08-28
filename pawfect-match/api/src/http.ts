import type { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import type { ApiConfig } from './config';

export function jsonResponse(
  request: HttpRequest,
  config: ApiConfig,
  status: number,
  body: unknown,
): HttpResponseInit {
  const origin = request.headers.get('origin');
  const headers: Record<string, string> = {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json',
    'Vary': 'Origin',
  };
  if (origin && config.allowedOrigins.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
  }
  return { status, headers, jsonBody: body };
}

export function handleError(
  request: HttpRequest,
  config: ApiConfig,
  context: InvocationContext,
  error: unknown,
): HttpResponseInit {
  context.error('RAG request failed', error instanceof Error ? error.message : String(error));
  return jsonResponse(request, config, 503, {
    error: 'The matching service is temporarily unavailable.',
    requestId: context.invocationId,
  });
}
import { RayfinClient } from '@microsoft/rayfin-client';

import type { TodoAppSchema } from '../../rayfin/data/schema';
import type { AppFunctionsSchema } from '../../rayfin/functions/src/types';

export interface RayfinClientConfig {
  baseUrl: string;
  publishableKey: string;
  /** True when the API URL points at localhost. Exposed via {@link isLocalBackend}. */
  localDev: boolean;
  /** Local function host override. Production functions use the Rayfin backend route. */
  functionsBaseUrl?: string;
}

let client: RayfinClient<TodoAppSchema, AppFunctionsSchema> | null = null;
let localDev = false;

export function initRayfinClient(
  config: RayfinClientConfig
): RayfinClient<TodoAppSchema, AppFunctionsSchema> {
  if (client) {
    throw new Error('Rayfin client is already initialized.');
  }
  client = new RayfinClient<TodoAppSchema, AppFunctionsSchema>({
    baseUrl: config.baseUrl,
    publishableKey: config.publishableKey,
    authStorage: true,
    functionsBaseUrl: config.functionsBaseUrl,
  });
  localDev = config.localDev;
  return client;
}

export function getRayfinClient(): RayfinClient<TodoAppSchema, AppFunctionsSchema> {
  if (!client) {
    throw new Error(
      'Rayfin client not initialized. Call bootstrapAuth() first.'
    );
  }
  return client;
}

/** True when the app was bootstrapped against a localhost backend. */
export function isLocalBackend(): boolean {
  return localDev;
}

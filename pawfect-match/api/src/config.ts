export interface ApiConfig {
  openAiEndpoint: string;
  embeddingDeployment: string;
  chatDeployment: string;
  sqlServer: string;
  sqlDatabase: string;
  allowedOrigins: Set<string>;
}

export function getConfig(): ApiConfig {
  const allowedOrigins = required('ALLOWED_ORIGINS')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (allowedOrigins.length === 0) {
    throw new Error('ALLOWED_ORIGINS must include at least one trusted origin.');
  }
  return {
    openAiEndpoint: required('AZURE_OPENAI_ENDPOINT').replace(/\/$/, ''),
    embeddingDeployment: required('AZURE_OPENAI_EMBEDDING_DEPLOYMENT'),
    chatDeployment: required('AZURE_OPENAI_CHAT_DEPLOYMENT'),
    sqlServer: required('FABRIC_SQL_SERVER').replace(/^tcp:/, '').split(',')[0],
    sqlDatabase: required('FABRIC_SQL_DATABASE'),
    allowedOrigins: new Set(allowedOrigins),
  };
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value || value.startsWith('<')) {
    throw new Error(`Missing required server setting: ${name}`);
  }
  return value;
}
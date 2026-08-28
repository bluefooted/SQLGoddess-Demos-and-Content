import { createEmbeddings, generateExplanations } from './azureOpenAi';
import type { ApiConfig } from './config';
import { searchKnowledge } from './database';
import { extractPreferences } from './preferences';
import { bestRowsPerPet } from './ragUtils';
import type { MatchResponse } from './types';

export async function matchLifestyle(config: ApiConfig, lifestyleText: string): Promise<MatchResponse> {
  const preferences = extractPreferences(lifestyleText);
  const [embedding] = await createEmbeddings(
    config.openAiEndpoint,
    config.embeddingDeployment,
    [lifestyleText],
  );
  const rows = await searchKnowledge(config, embedding, preferences);
  const distinctRows = bestRowsPerPet(rows, 3);
  if (distinctRows.length === 0) {
    return { mode: 'fabric-ai', extractedTraits: preferences.traits, results: [] };
  }
  const explanations = await generateExplanations(
    config.openAiEndpoint,
    config.chatDeployment,
    lifestyleText,
    preferences,
    distinctRows.flatMap(({ evidence }) => evidence),
  );

  return {
    mode: 'fabric-ai',
    extractedTraits: preferences.traits,
    results: distinctRows.map(({ pet, evidence }) => {
      const explanation = explanations.get(pet.id);
      return {
        pet,
        score: Math.round(Math.max(0, Math.min(1, evidence[0].similarity)) * 100),
        why: explanation?.why ?? ['Profile language is semantically aligned with your lifestyle.'],
        concerns: explanation?.concerns ?? ['Plan a shelter meet-and-greet to validate chemistry and routines.'],
        citations: evidence.map((row) => ({
          id: row.sourceId,
          petId: row.id,
          noteType: normalizeNoteType(row.sourceType),
          body: row.chunkText,
          sourceLabel: row.sourceLabel,
          authorEmail: 'Pawfect Match evidence index',
          createdAt: new Date().toISOString(),
        })),
      };
    }),
  };
}

function normalizeNoteType(value: string): 'Foster note' | 'Care guide' | 'Behavior assessment' {
  if (value === 'Foster note' || value === 'Behavior assessment') return value;
  return 'Care guide';
}
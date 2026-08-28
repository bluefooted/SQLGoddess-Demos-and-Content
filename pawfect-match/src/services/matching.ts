import { getCareNotes, getPets, recordRecommendation, type CareNoteRecord, type PetRecord } from './pets';
import { getRayfinClient } from './rayfinClient';

export interface MatchResult {
  pet: PetRecord;
  score: number;
  why: string[];
  concerns: string[];
  citations: CareNoteRecord[];
}

export interface MatchResponse {
  mode: 'fabric-ai' | 'demo-semantic';
  extractedTraits: string[];
  results: MatchResult[];
}

const STOP_WORDS = new Set(['that', 'with', 'have', 'want', 'work', 'from', 'three', 'week', 'live', 'good']);

export async function matchPets(lifestyleText: string): Promise<MatchResponse> {
  try {
    const response = await getRayfinClient().functions.matchPets.invoke({ lifestyleText });
    return {
      ...response,
      results: response.results.map((result) => ({
        ...result,
        citations: result.citations.map((citation) => ({
          ...citation,
          createdAt: new Date(citation.createdAt),
        })),
      })),
    };
  } catch (error) {
    console.warn('Using demo semantic matching because the Fabric matcher is unavailable.', error);
  }

  const [pets, notes] = await Promise.all([getPets(), getCareNotes()]);
  const normalized = lifestyleText.toLowerCase();
  const terms = [...new Set(normalized.match(/[a-z]+/g)?.filter((term) => term.length > 3 && !STOP_WORDS.has(term)) ?? [])];
  const wantsKids = /kid|child|family/.test(normalized);
  const apartment = /apartment|condo|small home/.test(normalized);
  const calm = /calm|quiet|low.energy|relaxed/.test(normalized);
  const species = ['dog', 'cat', 'rabbit'].find((item) => normalized.includes(item));
  const extractedTraits = [
    species && `${species[0].toUpperCase()}${species.slice(1)}`,
    wantsKids && 'Family friendly', apartment && 'Apartment compatible', calm && 'Low energy',
  ].filter(Boolean) as string[];

  const results = pets
    .filter((pet) => pet.adoptionStatus === 'Available')
    .map((pet) => scorePet(pet, notes.filter((note) => note.petId === pet.id), terms, {
      wantsKids, apartment, calm, species,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  results.forEach(({ pet }) => recordRecommendation(pet.id));
  return { mode: 'demo-semantic', extractedTraits, results };
}

function scorePet(
  pet: PetRecord,
  petNotes: CareNoteRecord[],
  terms: string[],
  preferences: { wantsKids: boolean; apartment: boolean; calm: boolean; species?: string },
): MatchResult {
  const corpus = `${pet.bio} ${pet.temperament.join(' ')} ${pet.housingNeeds} ${petNotes.map((note) => note.body).join(' ')}`.toLowerCase();
  const semanticHits = terms.filter((term) => corpus.includes(term)).length;
  let score = 58 + Math.min(18, semanticHits * 4);
  const why: string[] = [];
  const concerns: string[] = [];

  if (!preferences.species || pet.species.toLowerCase() === preferences.species) {
    score += 8;
    if (preferences.species) why.push(`Matches your preference for a ${preferences.species}.`);
  } else concerns.push(`You mentioned a ${preferences.species}, while ${pet.name} is a ${pet.species.toLowerCase()}.`);

  if (preferences.wantsKids) {
    if (pet.goodWithKids) { score += 12; why.push('Positive history with children and family settings.'); }
    else { score -= 22; concerns.push('Not recommended for a home with young children.'); }
  }
  if (preferences.apartment) {
    if (/apartment|indoor|quiet/.test(pet.housingNeeds.toLowerCase())) { score += 10; why.push('Housing needs are compatible with smaller-space living.'); }
    else { score -= 12; concerns.push(pet.housingNeeds); }
  }
  if (preferences.calm) {
    if (pet.energyLevel === 'Low') { score += 12; why.push('Low energy level fits a calm household rhythm.'); }
    else if (pet.energyLevel === 'High') { score -= 18; concerns.push('High daily exercise and enrichment needs.'); }
  }
  if (semanticHits > 0) why.push(`${semanticHits} lifestyle themes align with profile and care-note language.`);
  if (concerns.length === 0) concerns.push('Plan a shelter meet-and-greet to validate chemistry and routines.');

  return { pet, score: Math.max(35, Math.min(98, score)), why, concerns, citations: petNotes.slice(0, 2) };
}
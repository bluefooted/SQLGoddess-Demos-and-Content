import { describe, expect, it } from 'vitest';

import { bestRowsPerPet } from './ragUtils';
import type { KnowledgeRow } from './types';

function row(petId: string, sourceId: string, similarity: number): KnowledgeRow {
  return {
    id: petId,
    shelterId: 'shelter-1',
    shelterName: 'City Tails',
    name: petId,
    species: 'Dog',
    breed: 'Mix',
    ageYears: 4,
    size: 'Medium',
    energyLevel: 'Low',
    temperament: ['Calm'],
    goodWithKids: true,
    goodWithOtherPets: true,
    housingNeeds: 'Apartment friendly',
    bio: 'Calm family dog',
    adoptionStatus: 'Available',
    recommendationCount: 1,
    imageUrl: 'https://example.test/pet.jpg',
    sourceId,
    sourceType: 'Foster note',
    sourceLabel: sourceId,
    chunkText: 'Grounded evidence',
    similarity,
  };
}

describe('bestRowsPerPet', () => {
  it('ranks distinct pets and retains at most two citations each', () => {
    const grouped = bestRowsPerPet([
      row('luna', 'luna-1', 0.94),
      row('luna', 'luna-2', 0.91),
      row('luna', 'luna-3', 0.85),
      row('milo', 'milo-1', 0.88),
    ], 3);

    expect(grouped.map(({ pet }) => pet.id)).toEqual(['luna', 'milo']);
    expect(grouped[0].evidence.map(({ sourceId }) => sourceId)).toEqual(['luna-1', 'luna-2']);
  });
});
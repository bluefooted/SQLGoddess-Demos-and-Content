export interface PetRecord {
  id: string;
  shelterId: string;
  shelterName: string;
  name: string;
  species: string;
  breed: string;
  ageYears: number;
  size: string;
  energyLevel: string;
  temperament: string[];
  goodWithKids: boolean;
  goodWithOtherPets: boolean;
  housingNeeds: string;
  bio: string;
  adoptionStatus: 'Available' | 'Pending' | 'Adopted';
  recommendationCount: number;
  imageUrl: string;
}

export interface Citation {
  id: string;
  petId: string;
  noteType: 'Foster note' | 'Care guide' | 'Behavior assessment';
  body: string;
  sourceLabel: string;
  authorEmail: string;
  createdAt: string;
}

export interface MatchResult {
  pet: PetRecord;
  score: number;
  why: string[];
  concerns: string[];
  citations: Citation[];
}

export interface MatchResponse {
  mode: 'fabric-ai';
  extractedTraits: string[];
  results: MatchResult[];
}

export interface Preferences {
  species?: string;
  goodWithKids?: boolean;
  energyLevel?: string;
  apartment: boolean;
  traits: string[];
}

export interface KnowledgeSource {
  id: string;
  petId: string;
  sourceType: string;
  sourceLabel: string;
  text: string;
}

export interface KnowledgeRow extends PetRecord {
  sourceId: string;
  sourceType: string;
  sourceLabel: string;
  chunkText: string;
  similarity: number;
}
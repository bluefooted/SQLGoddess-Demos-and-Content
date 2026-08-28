import {
  AudienceType,
  UserDataFunctions,
  type RayfinContext,
} from '@microsoft/fabric-user-data-functions';
import sql from 'mssql';

const udf = new UserDataFunctions();
const SQL_SERVER = 'x6eps4xrq2xudenlfv6naeo3i4-dxfehldjjahutc3x3yd4rhloy4.msit-database.fabric.microsoft.com';
const SQL_DATABASE = 'pawfect-match-f7a629d2-93ae-495d-9099-8bfc9cd55215';

interface MatchResult {
  pet: {
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
    adoptionStatus: 'Available';
    recommendationCount: number;
    imageUrl: string;
  };
  score: number;
  why: string[];
  concerns: string[];
  citations: Array<{
    id: string;
    petId: string;
    noteType: 'Foster note' | 'Care guide' | 'Behavior assessment';
    body: string;
    sourceLabel: string;
    authorEmail: string;
    createdAt: string;
  }>;
}

interface MatchResponse {
  mode: 'fabric-ai';
  extractedTraits: string[];
  results: MatchResult[];
}

interface KnowledgeRow extends Record<string, unknown> {
  pet_id: string;
  pet_name: string;
  shelter_id: string;
  shelter_name: string;
  species: string;
  breed: string;
  age_years: number;
  size: string;
  energy_level: string;
  temperament: string;
  good_with_kids: boolean;
  good_with_other_pets: boolean;
  housing_needs: string;
  bio: string;
  image_url: string;
  recommendation_count: number;
  source_type: string;
  source_id: string;
  source_label: string;
  chunk_text: string;
  similarity: number;
}

udf.func(
  'matchPets',
  async (lifestyleText: string, ctx: RayfinContext): Promise<MatchResponse> => {
    const lifestyle = lifestyleText.trim();
    if (lifestyle.length < 10 || lifestyle.length > 3000) {
      throw new Error('Lifestyle text must be between 10 and 3,000 characters.');
    }

    const preferences = extractPreferences(lifestyle);
    const pool = await sql.connect({
      server: SQL_SERVER,
      database: SQL_DATABASE,
      options: { encrypt: true, trustServerCertificate: false },
      authentication: {
        type: 'azure-active-directory-access-token',
        options: { token: ctx.getToken(AudienceType.Sql) },
      },
      pool: { min: 0, max: 4, idleTimeoutMillis: 30_000 },
    });

    try {
      const query = await pool.request()
        .input('lifestyleText', sql.NVarChar(3000), lifestyle)
        .input('species', sql.NVarChar(60), preferences.species)
        .input('goodWithKids', sql.Bit, preferences.goodWithKids)
        .input('energyLevel', sql.NVarChar(40), preferences.energyLevel)
        .input('top', sql.Int, 12)
        .execute('dbo.MatchPetsByLifestyle');

      return {
        mode: 'fabric-ai',
        extractedTraits: preferences.traits,
        results: groupMatches(query.recordset as KnowledgeRow[]),
      };
    } finally {
      await pool.close();
    }
  },
  [udf.connection({ audienceType: AudienceType.Sql })],
);

function extractPreferences(lifestyleText: string): {
  species: string | null;
  goodWithKids: boolean | null;
  energyLevel: string | null;
  traits: string[];
} {
  const normalized = lifestyleText.toLowerCase();
  const species = ['dog', 'cat', 'rabbit'].find((value) => normalized.includes(value)) ?? null;
  const goodWithKids = /kid|child|family/.test(normalized) ? true : null;
  const energyLevel = /calm|quiet|low[ -]?energy|relaxed/.test(normalized) ? 'Low' : null;
  const traits = [
    species && `${species[0].toUpperCase()}${species.slice(1)}`,
    goodWithKids && 'Family friendly',
    /apartment|condo|small home/.test(normalized) && 'Apartment compatible',
    energyLevel && 'Low energy',
  ].filter((value): value is string => Boolean(value));

  return { species, goodWithKids, energyLevel, traits };
}

function groupMatches(rows: KnowledgeRow[]): MatchResult[] {
  const grouped = new Map<string, KnowledgeRow[]>();
  for (const row of rows) {
    grouped.set(row.pet_id, [...(grouped.get(row.pet_id) ?? []), row]);
  }

  return [...grouped.values()].slice(0, 3).map((evidence) => {
    const best = evidence[0];
    return {
      pet: {
        id: best.pet_id,
        shelterId: best.shelter_id,
        shelterName: best.shelter_name,
        name: best.pet_name,
        species: best.species,
        breed: best.breed,
        ageYears: Number(best.age_years),
        size: best.size,
        energyLevel: best.energy_level,
        temperament: best.temperament.split(',').map((value) => value.trim()).filter(Boolean),
        goodWithKids: Boolean(best.good_with_kids),
        goodWithOtherPets: Boolean(best.good_with_other_pets),
        housingNeeds: best.housing_needs,
        bio: best.bio,
        adoptionStatus: 'Available',
        recommendationCount: Number(best.recommendation_count),
        imageUrl: best.image_url ?? '',
      },
      score: Math.round(Math.max(0, Math.min(1, Number(best.similarity))) * 100),
      why: ['Profile and care-note evidence is semantically aligned with your lifestyle.'],
      concerns: ['Plan a shelter meet-and-greet to validate chemistry and routines.'],
      citations: evidence.slice(0, 2).map((row) => ({
        id: row.source_id,
        petId: row.pet_id,
        noteType: normalizeNoteType(row.source_type),
        body: row.chunk_text,
        sourceLabel: row.source_label,
        authorEmail: 'Pawfect Match evidence index',
        createdAt: new Date().toISOString(),
      })),
    };
  });
}

function normalizeNoteType(value: string): MatchResult['citations'][number]['noteType'] {
  if (value === 'Foster note' || value === 'Behavior assessment') return value;
  return 'Care guide';
}

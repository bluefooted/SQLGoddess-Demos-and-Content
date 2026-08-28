import { getRayfinClient, isLocalBackend } from './rayfinClient';

export type AdoptionStatus = 'Available' | 'Pending' | 'Adopted';

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
  adoptionStatus: AdoptionStatus;
  recommendationCount: number;
  imageUrl: string;
}

export interface CareNoteRecord {
  id: string;
  petId: string;
  noteType: 'Foster note' | 'Care guide' | 'Behavior assessment';
  body: string;
  sourceLabel: string;
  authorEmail: string;
  createdAt: Date;
}

export interface PetProfileRecord {
  id: string;
  petId: string;
  dailyRoutine: string;
  idealHome: string;
  medicalSummary: string;
  trainingNotes: string;
}

interface RayfinPetRow {
  id: string;
  shelter: { id: string; name: string };
  name: string;
  species: string;
  breed: string;
  ageYears: number;
  size: string;
  energyLevel: string;
  temperament: string;
  goodWithKids: boolean;
  goodWithOtherPets: boolean;
  housingNeeds: string;
  bio: string;
  imageUrl: string;
  adoptionStatus: string;
  recommendationCount: number;
}

const PETS: PetRecord[] = [
  {
    id: 'pet-luna', shelterId: 'shelter-city', shelterName: 'City Tails Rescue', name: 'Luna',
    species: 'Dog', breed: 'Labrador mix', ageYears: 4, size: 'Medium', energyLevel: 'Low',
    temperament: ['Calm', 'Affectionate', 'Patient'], goodWithKids: true, goodWithOtherPets: true,
    housingNeeds: 'Apartment friendly with two relaxed walks each day.',
    bio: 'A gentle family dog who settles beside a desk during the workday and loves quiet evenings.',
    adoptionStatus: 'Available', recommendationCount: 84,
    imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'pet-milo', shelterId: 'shelter-north', shelterName: 'Northside Animal Haven', name: 'Milo',
    species: 'Cat', breed: 'Domestic shorthair', ageYears: 2, size: 'Small', energyLevel: 'Medium',
    temperament: ['Curious', 'Social', 'Playful'], goodWithKids: true, goodWithOtherPets: true,
    housingNeeds: 'Indoor home with climbing space and daily play.',
    bio: 'Confident, friendly, and happiest when he can supervise family life from a sunny perch.',
    adoptionStatus: 'Available', recommendationCount: 61,
    imageUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'pet-bowie', shelterId: 'shelter-city', shelterName: 'City Tails Rescue', name: 'Bowie',
    species: 'Dog', breed: 'Australian shepherd', ageYears: 3, size: 'Medium', energyLevel: 'High',
    temperament: ['Smart', 'Active', 'Loyal'], goodWithKids: true, goodWithOtherPets: false,
    housingNeeds: 'Needs a yard or an active household with daily training.',
    bio: 'A brilliant adventure partner who thrives on puzzles, trail time, and learning new jobs.',
    adoptionStatus: 'Available', recommendationCount: 43,
    imageUrl: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'pet-pepper', shelterId: 'shelter-harbor', shelterName: 'Harbor Humane', name: 'Pepper',
    species: 'Dog', breed: 'Senior terrier mix', ageYears: 9, size: 'Small', energyLevel: 'Low',
    temperament: ['Gentle', 'Independent', 'Quiet'], goodWithKids: false, goodWithOtherPets: true,
    housingNeeds: 'Quiet home; stairs should be limited.',
    bio: 'An overlooked senior with impeccable house manners who asks for very little beyond companionship.',
    adoptionStatus: 'Available', recommendationCount: 12,
    imageUrl: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'pet-maple', shelterId: 'shelter-north', shelterName: 'Northside Animal Haven', name: 'Maple',
    species: 'Cat', breed: 'Maine Coon mix', ageYears: 6, size: 'Large', energyLevel: 'Low',
    temperament: ['Calm', 'Reserved', 'Affectionate'], goodWithKids: true, goodWithOtherPets: false,
    housingNeeds: 'Indoor home with a quiet retreat and regular grooming.',
    bio: 'A soft-spoken companion who warms up slowly, then becomes a devoted couch and reading buddy.',
    adoptionStatus: 'Pending', recommendationCount: 27,
    imageUrl: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'pet-juniper', shelterId: 'shelter-harbor', shelterName: 'Harbor Humane', name: 'Juniper',
    species: 'Rabbit', breed: 'Mini Rex', ageYears: 1, size: 'Small', energyLevel: 'Medium',
    temperament: ['Gentle', 'Curious', 'Shy'], goodWithKids: true, goodWithOtherPets: false,
    housingNeeds: 'Indoor exercise pen with supervised roaming time.',
    bio: 'A velvety, observant rabbit who enjoys forage games and patient people.',
    adoptionStatus: 'Available', recommendationCount: 19,
    imageUrl: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'pet-atlas', shelterId: 'shelter-harbor', shelterName: 'Harbor Humane', name: 'Atlas',
    species: 'Dog', breed: 'Great Pyrenees mix', ageYears: 3, size: 'Extra large', energyLevel: 'Medium',
    temperament: ['Watchful', 'Calm', 'Independent'], goodWithKids: true, goodWithOtherPets: true,
    housingNeeds: 'Securely fenced rural or suburban property; not suited to apartment living.',
    bio: 'A steady livestock guardian who bonds closely with his family and prefers room to patrol at his own pace.',
    adoptionStatus: 'Available', recommendationCount: 8,
    imageUrl: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=900&q=85',
  },
];

const NOTES: CareNoteRecord[] = [
  { id: 'note-luna-1', petId: 'pet-luna', noteType: 'Foster note', body: 'Luna is relaxed while I take video calls and greets both of my children gently after school.', sourceLabel: 'Foster diary · Aug 18', authorEmail: 'maya@citytails.org', createdAt: new Date('2026-08-18') },
  { id: 'note-luna-2', petId: 'pet-luna', noteType: 'Behavior assessment', body: 'Low startle response, no resource guarding observed, and consistently soft body language with children.', sourceLabel: 'Behavior assessment · Aug 12', authorEmail: 'behavior@citytails.org', createdAt: new Date('2026-08-12') },
  { id: 'note-milo-1', petId: 'pet-milo', noteType: 'Foster note', body: 'Milo adapts quickly, seeks friendly children, and has lived comfortably with another cat.', sourceLabel: 'Foster diary · Aug 20', authorEmail: 'care@northside.org', createdAt: new Date('2026-08-20') },
  { id: 'note-bowie-1', petId: 'pet-bowie', noteType: 'Care guide', body: 'Bowie needs at least 75 minutes of exercise plus structured enrichment every day.', sourceLabel: 'Individual care plan · Aug 9', authorEmail: 'trainer@citytails.org', createdAt: new Date('2026-08-09') },
  { id: 'note-pepper-1', petId: 'pet-pepper', noteType: 'Foster note', body: 'Pepper sleeps through the workday and enjoys short neighborhood walks, but avoids noisy young children.', sourceLabel: 'Senior foster diary · Aug 21', authorEmail: 'seniors@harborhumane.org', createdAt: new Date('2026-08-21') },
  { id: 'note-maple-1', petId: 'pet-maple', noteType: 'Care guide', body: 'Maple needs weekly brushing and a private room for her first two weeks in a new home.', sourceLabel: 'Transition guide · Aug 16', authorEmail: 'cats@northside.org', createdAt: new Date('2026-08-16') },
  { id: 'note-juniper-1', petId: 'pet-juniper', noteType: 'Care guide', body: 'Juniper needs a four-by-four-foot indoor pen and at least three hours of supervised roaming.', sourceLabel: 'Rabbit care plan · Aug 17', authorEmail: 'smallpets@harborhumane.org', createdAt: new Date('2026-08-17') },
  { id: 'note-atlas-1', petId: 'pet-atlas', noteType: 'Foster note', body: 'Atlas has lived calmly with goats and a family dog. He patrols the fence line, alerts with a deep bark after dark, and needs secure fencing plus patient introductions to new animals.', sourceLabel: 'Livestock foster assessment · Aug 24', authorEmail: 'workingdogs@harborhumane.org', createdAt: new Date('2026-08-24') },
];

const PROFILES: PetProfileRecord[] = [
  { id: 'profile-luna', petId: 'pet-luna', dailyRoutine: 'Two relaxed walks, a midday garden break, and quiet time near her people.', idealHome: 'A family home or apartment with predictable routines and gentle children.', medicalSummary: 'Healthy adult; routine preventive care is current.', trainingNotes: 'House-trained, walks politely, and responds well to food-based rewards.' },
  { id: 'profile-milo', petId: 'pet-milo', dailyRoutine: 'Morning and evening play sessions followed by long naps in a sunny perch.', idealHome: 'An indoor home with climbing space, friendly people, and a gradual introduction to pets.', medicalSummary: 'Healthy adult; routine preventive care is current.', trainingNotes: 'Uses a litter box reliably and redirects easily to scratching posts.' },
  { id: 'profile-bowie', petId: 'pet-bowie', dailyRoutine: 'At least 75 minutes of exercise plus puzzles and short training sessions.', idealHome: 'An active household with a fenced yard and interest in ongoing dog training.', medicalSummary: 'Healthy adult with no current medical restrictions.', trainingNotes: 'Knows core cues and needs continued work on calm greetings and dog reactivity.' },
  { id: 'profile-pepper', petId: 'pet-pepper', dailyRoutine: 'Short neighborhood walks, regular rest breaks, and a quiet evening routine.', idealHome: 'A calm, adult household with limited stairs and a soft place to rest.', medicalSummary: 'Senior wellness is stable; takes a daily joint supplement.', trainingNotes: 'House-trained and comfortable being alone for moderate periods.' },
  { id: 'profile-maple', petId: 'pet-maple', dailyRoutine: 'Quiet observation, gentle play, and weekly coat care.', idealHome: 'A patient indoor home with a private transition room and no other pets.', medicalSummary: 'Healthy adult; long coat requires consistent grooming.', trainingNotes: 'Uses a litter box reliably and warms up with slow, reward-based introductions.' },
  { id: 'profile-juniper', petId: 'pet-juniper', dailyRoutine: 'Morning forage, supervised roaming, afternoon rest, and evening enrichment.', idealHome: 'An indoor home with a large exercise pen and calm, supervised handling.', medicalSummary: 'Healthy young rabbit; requires a hay-based diet and rabbit-experienced veterinary care.', trainingNotes: 'Litter habits are improving and she responds well to target training.' },
  { id: 'profile-atlas', petId: 'pet-atlas', dailyRoutine: 'Patrols a securely fenced property, rests near livestock by day, and alerts after dark.', idealHome: 'A rural or spacious suburban property with secure fencing and livestock guardian experience.', medicalSummary: 'Healthy adult; his large frame benefits from measured meals and routine joint monitoring.', trainingNotes: 'Understands boundary routines and needs patient introductions to unfamiliar animals and visitors.' },
];

let pets = [...PETS];
let notes = [...NOTES];

function isBrowserPreview(): boolean {
  return import.meta.env.DEV &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
}

export async function getPets(): Promise<PetRecord[]> {
  if (!isBrowserPreview() && !isLocalBackend()) {
    try {
      const rows = await getRayfinClient().data.Pet.select([
        'id', 'name', 'species', 'breed', 'ageYears', 'size', 'energyLevel', 'temperament',
        'goodWithKids', 'goodWithOtherPets', 'housingNeeds', 'bio', 'imageUrl', 'adoptionStatus',
        'recommendationCount', 'shelter.id', 'shelter.name',
      ]).orderBy({ createdAt: 'desc' }).execute();
      if (rows.length > 0) return rows.map(mapRayfinPet);
    } catch (error) {
      console.warn('Using demo pet records until the Fabric schema is deployed.', error);
    }
  }
  return [...pets];
}

export async function getCareNotes(): Promise<CareNoteRecord[]> {
  if (!isBrowserPreview() && !isLocalBackend()) {
    try {
      const rows = await getRayfinClient().data.CareNote.select([
        'id', 'pet.id', 'noteType', 'body', 'sourceLabel', 'authorEmail', 'createdAt',
      ]).orderBy({ createdAt: 'desc' }).execute();
      if (rows.length > 0) {
        return rows.map((row) => ({
          id: row.id, petId: row.pet.id, noteType: row.noteType as CareNoteRecord['noteType'],
          body: row.body, sourceLabel: row.sourceLabel, authorEmail: row.authorEmail,
          createdAt: new Date(row.createdAt),
        }));
      }
    } catch (error) {
      console.warn('Using demo care notes until the Fabric schema is deployed.', error);
    }
  }
  return [...notes];
}

export async function getPetProfiles(): Promise<PetProfileRecord[]> {
  if (!isBrowserPreview() && !isLocalBackend()) {
    try {
      const rows = await getRayfinClient().data.PetProfile.select([
        'id', 'pet.id', 'dailyRoutine', 'idealHome', 'medicalSummary', 'trainingNotes',
      ]).execute();
      if (rows.length > 0) {
        return rows.map((row) => ({
          id: row.id, petId: row.pet.id, dailyRoutine: row.dailyRoutine,
          idealHome: row.idealHome, medicalSummary: row.medicalSummary,
          trainingNotes: row.trainingNotes,
        }));
      }
    } catch (error) {
      console.warn('Using demo pet profiles until the Fabric profiles are available.', error);
    }
  }
  return [...PROFILES];
}

export async function addDemoPet(input: Omit<PetRecord, 'id' | 'recommendationCount' | 'imageUrl'>): Promise<PetRecord> {
  const pet: PetRecord = {
    ...input,
    id: crypto.randomUUID(),
    recommendationCount: 0,
    imageUrl: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=900&q=85',
  };
  pets = [pet, ...pets];
  return pet;
}

export async function addCareNote(input: Omit<CareNoteRecord, 'id' | 'createdAt'>): Promise<CareNoteRecord> {
  const note = { ...input, id: crypto.randomUUID(), createdAt: new Date() };
  notes = [note, ...notes];
  return note;
}

export function recordRecommendation(petId: string): void {
  pets = pets.map((pet) => pet.id === petId
    ? { ...pet, recommendationCount: pet.recommendationCount + 1 }
    : pet);
}

function mapRayfinPet(row: RayfinPetRow): PetRecord {
  return {
    id: row.id, shelterId: row.shelter.id, shelterName: row.shelter.name, name: row.name,
    species: row.species, breed: row.breed, ageYears: row.ageYears, size: row.size,
    energyLevel: row.energyLevel, temperament: row.temperament.split(',').map((item: string) => item.trim()),
    goodWithKids: row.goodWithKids, goodWithOtherPets: row.goodWithOtherPets,
    housingNeeds: row.housingNeeds, bio: row.bio,
    adoptionStatus: isAdoptionStatus(row.adoptionStatus) ? row.adoptionStatus : 'Available',
    recommendationCount: row.recommendationCount,
    imageUrl: row.imageUrl || (PETS.find((pet) => pet.name === row.name)?.imageUrl ?? PETS[0].imageUrl),
  };
}

function isAdoptionStatus(value: string): value is AdoptionStatus {
  return value === 'Available' || value === 'Pending' || value === 'Adopted';
}
/**
 * Function schema types for RayfinClient.
 *
 * AUTO-GENERATED — do not edit manually.
 * Re-generated automatically when function source files change.
 *
 * If this file is not updating automatically, run:
 *   rayfin dev functions apply
 *
 * The schema is a closed object type: only the function names listed
 * below are accepted by RayfinClient.functions.<name>.invoke(...).
 * Adding, renaming, or changing the signature of a udf.func() call
 * regenerates this file and surfaces type errors at every consumer.
 *
 * IMPORTANT: This file must NOT import any Node.js packages — it is
 * resolved by the frontend app's TypeScript compiler.
 */

export type AppFunctionsSchema = {
  matchPets: {
    input: { lifestyleText: string };
    output: { mode: 'fabric-ai'; extractedTraits: string[]; results: { pet: { id: string; shelterId: string; shelterName: string; name: string; species: string; breed: string; ageYears: number; size: string; energyLevel: string; temperament: string[]; goodWithKids: boolean; goodWithOtherPets: boolean; housingNeeds: string; bio: string; adoptionStatus: 'Available'; recommendationCount: number; imageUrl: string }; score: number; why: string[]; concerns: string[]; citations: { id: string; petId: string; noteType: 'Foster note' | 'Care guide' | 'Behavior assessment'; body: string; sourceLabel: string; authorEmail: string; createdAt: string }[] }[] };
  };
};

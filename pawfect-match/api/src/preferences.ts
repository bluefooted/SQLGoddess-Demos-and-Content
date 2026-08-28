import type { Preferences } from './types';

export function extractPreferences(text: string): Preferences {
  const normalized = text.toLowerCase();
  const species = ['dog', 'cat', 'rabbit'].find((value) => normalized.includes(value));
  const family = /\b(kid|kids|child|children|family)\b/.test(normalized);
  const calm = /\b(calm|quiet|relaxed|low[ -]?energy)\b/.test(normalized);
  const active = /\b(active|running|hiking|high[ -]?energy)\b/.test(normalized);
  const apartment = /\b(apartment|condo|small home)\b/.test(normalized);

  return {
    species: species ? titleCase(species) : undefined,
    goodWithKids: family ? true : undefined,
    energyLevel: calm ? 'Low' : active ? 'High' : undefined,
    apartment,
    traits: [
      species && titleCase(species),
      family && 'Family friendly',
      apartment && 'Apartment compatible',
      calm && 'Low energy',
      active && 'Active lifestyle',
    ].filter(Boolean) as string[],
  };
}

function titleCase(value: string): string {
  return `${value[0].toUpperCase()}${value.slice(1)}`;
}
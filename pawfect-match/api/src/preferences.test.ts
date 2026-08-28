import { describe, expect, it } from 'vitest';

import { extractPreferences } from './preferences';

describe('extractPreferences', () => {
  it('extracts hard filters and display traits from lifestyle text', () => {
    expect(extractPreferences(
      'I live in an apartment with two kids and want a calm dog.',
    )).toEqual({
      species: 'Dog',
      goodWithKids: true,
      energyLevel: 'Low',
      apartment: true,
      traits: ['Dog', 'Family friendly', 'Apartment compatible', 'Low energy'],
    });
  });

  it('does not invent unspecified hard filters', () => {
    expect(extractPreferences('I work from home and enjoy a steady routine.')).toMatchObject({
      species: undefined,
      goodWithKids: undefined,
      energyLevel: undefined,
    });
  });
});
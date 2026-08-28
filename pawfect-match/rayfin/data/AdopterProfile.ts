import { date, entity, int, role, text, uuid } from '@microsoft/rayfin-core';

@entity()
@role('authenticated', '*', {
  policy: (claims, item) => claims.sub.eq(item.user_id),
})
export class AdopterProfile {
  @uuid() id!: string;
  @text({ max: 3000 }) lifestyleText!: string;
  @text({ max: 60 }) housingType!: string;
  @int() childrenCount!: number;
  @text({ max: 120 }) existingPets!: string;
  @text({ max: 40 }) preferredSpecies!: string;
  @text({ max: 40 }) preferredSize!: string;
  @text({ max: 40 }) preferredEnergyLevel!: string;
  @text({ max: 300 }) requestedTraits!: string;
  @date() createdAt!: Date;
  @text({ max: 200 }) user_id!: string;
}
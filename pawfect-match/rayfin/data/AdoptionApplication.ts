import {
  date,
  decimal,
  entity,
  one,
  role,
  text,
  uuid,
} from '@microsoft/rayfin-core';

import { Pet } from './Pet.js';

@entity()
@role('authenticated', '*', {
  policy: (claims, item) => claims.sub.eq(item.user_id),
})
export class AdoptionApplication {
  @uuid() id!: string;
  @one(() => Pet) pet!: Pet;
  @text({ max: 40 }) status!: string;
  @decimal({ precision: 5, scale: 2 }) matchScore!: number;
  @text({ max: 2000 }) applicantMessage!: string;
  @date() submittedAt!: Date;
  @text({ max: 200 }) user_id!: string;
}
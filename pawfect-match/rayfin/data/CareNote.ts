import { date, entity, one, role, text, uuid } from '@microsoft/rayfin-core';

import { Pet } from './Pet.js';

@entity()
@role('authenticated', '*')
export class CareNote {
  @uuid() id!: string;
  @one(() => Pet) pet!: Pet;
  @text({ max: 60 }) noteType!: string;
  @text({ max: 3000 }) body!: string;
  @text({ max: 200 }) sourceLabel!: string;
  @text({ max: 200 }) authorEmail!: string;
  @date() createdAt!: Date;
}
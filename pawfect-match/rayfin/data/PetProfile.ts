import { entity, one, role, text, uuid } from '@microsoft/rayfin-core';

import { Pet } from './Pet.js';

@entity()
@role('authenticated', '*')
export class PetProfile {
  @uuid() id!: string;
  @one(() => Pet) pet!: Pet;
  @text({ max: 1000 }) dailyRoutine!: string;
  @text({ max: 1000 }) idealHome!: string;
  @text({ max: 1000 }) medicalSummary!: string;
  @text({ max: 1000 }) trainingNotes!: string;
}
import {
  boolean,
  date,
  entity,
  int,
  one,
  role,
  text,
  uuid,
} from '@microsoft/rayfin-core';

import { Shelter } from './Shelter.js';

@entity()
@role('authenticated', '*')
export class Pet {
  @uuid() id!: string;
  @one(() => Shelter) shelter!: Shelter;
  @text({ max: 120 }) name!: string;
  @text({ max: 60 }) species!: string;
  @text({ max: 120 }) breed!: string;
  @int() ageYears!: number;
  @text({ max: 40 }) size!: string;
  @text({ max: 40 }) energyLevel!: string;
  @text({ max: 500 }) temperament!: string;
  @boolean() goodWithKids!: boolean;
  @boolean() goodWithOtherPets!: boolean;
  @text({ max: 500 }) housingNeeds!: string;
  @text({ max: 3000 }) bio!: string;
  @text({ max: 1000 }) imageUrl!: string;
  @text({ max: 40 }) adoptionStatus!: string;
  @int() recommendationCount!: number;
  @date() createdAt!: Date;
}
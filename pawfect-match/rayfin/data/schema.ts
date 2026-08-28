import { AdopterProfile } from './AdopterProfile.js';
import { AdoptionApplication } from './AdoptionApplication.js';
import { CareNote } from './CareNote.js';
import { Pet } from './Pet.js';
import { PetProfile } from './PetProfile.js';
import { Shelter } from './Shelter.js';
import { Todo } from './Todo.js';

export type TodoAppSchema = {
  AdopterProfile: AdopterProfile;
  AdoptionApplication: AdoptionApplication;
  CareNote: CareNote;
  Pet: Pet;
  PetProfile: PetProfile;
  Shelter: Shelter;
  Todo: Todo;
};

export const schema = [
  Shelter,
  Pet,
  PetProfile,
  AdopterProfile,
  CareNote,
  AdoptionApplication,
  Todo,
];

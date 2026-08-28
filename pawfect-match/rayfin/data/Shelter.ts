import { entity, role, text, uuid } from '@microsoft/rayfin-core';

@entity()
@role('authenticated', '*')
export class Shelter {
  @uuid() id!: string;
  @text({ max: 160 }) name!: string;
  @text({ max: 120 }) city!: string;
  @text({ max: 60 }) state!: string;
  @text({ max: 200 }) contactEmail!: string;
  @text({ max: 500, optional: true }) website?: string;
}
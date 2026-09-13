import { IsObject } from 'class-validator';

export class UpdateSettingsDto {
  @IsObject()
  global: Record<string, unknown>;
}

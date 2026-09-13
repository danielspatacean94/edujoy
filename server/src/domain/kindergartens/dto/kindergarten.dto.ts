import { IsString, Length, IsInt, Min, Max, IsOptional, IsMongoId } from 'class-validator';
import { Transform } from 'class-transformer';
export class SaveKindergartenDto {
  @IsString() @Length(1, 120) @Transform(({ value }) => typeof value === 'string' ? value.trim() : value) name: string;
  @IsString() @Length(1, 250) @Transform(({ value }) => typeof value === "string" ? value.trim() : value) location: string;
}
export class KindergartenResponseDto {
  id: string;
  name: string;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

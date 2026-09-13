import { IsMongoId, Length, ValidateIf, IsOptional, IsIn, IsString } from 'class-validator';

export class UpdateUserDto {
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Length(1, 120)
  fullName?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsMongoId()
  kindergartenId?: string;

  @IsOptional()
  @IsIn(['admin', 'teacher'])
  role?: 'admin' | 'teacher';
}

import { IsMongoId, Length, ValidateIf, IsEmail, IsString, MinLength, IsOptional, IsIn } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Length(1, 120)
  fullName?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsMongoId()
  kindergartenId?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsIn(['admin', 'teacher'])
  role?: 'admin' | 'teacher';
}

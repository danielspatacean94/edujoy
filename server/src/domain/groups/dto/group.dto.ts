import { Transform } from 'class-transformer';
import { IsString, Length, IsMongoId, ValidateIf } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class SaveGroupDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @Length(1, 120) name: string;
  @ValidateIf((_, value) => value !== undefined) @IsMongoId() kindergartenId?: string;
}

export class GroupQueryDto extends PaginationQueryDto {
  @ValidateIf((_, value) => value !== undefined) @IsMongoId() kindergartenId?: string;
}

export class GroupResponseDto {
  id: string;
  name: string;
  kindergartenId: string;
  childrenCount: number;
  createdAt: Date;
  updatedAt: Date;
}

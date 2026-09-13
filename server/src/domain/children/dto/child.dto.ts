import { IsString, Length, IsInt, Min, Max, IsOptional, IsMongoId } from 'class-validator';
import { Transform } from 'class-transformer';
import { GroupQueryDto } from '../../groups/dto/group.dto';
export class SaveChildDto {
  @IsString() @Length(1, 120) @Transform(({ value }) => typeof value === 'string' ? value.trim() : value) name: string;
  @IsInt() @Min(0) @Max(18) age: number;
  @IsOptional() @IsMongoId() kindergartenId?: string;
  @IsMongoId() groupId: string;
}
export class ChildQueryDto extends GroupQueryDto {
  @IsOptional() @IsMongoId() groupId?: string;
}
export class ChildResponseDto {
  id: string;
  name: string;
  age: number; kindergartenId: string;
  groupId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

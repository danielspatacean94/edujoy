import { IsArray, IsIn, IsMongoId, IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CalendarOptionDto {
  @IsString() @Length(1, 80) label: string;
  @IsString() @Length(1, 500) image: string;
}
export class CalendarQuestionDto {
  @IsIn(['weekday', 'weather', 'season', 'activity']) type: 'weekday' | 'weather' | 'season' | 'activity';
  @IsString() @Length(1, 120) label: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => CalendarOptionDto) options: CalendarOptionDto[];
}
export class SaveMorningCalendarDto {
  @IsMongoId() groupId: string;
  @IsString() date: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => CalendarQuestionDto) questions: CalendarQuestionDto[];
}
export class MorningCalendarQueryDto { @IsOptional() @IsMongoId() groupId?: string; @IsOptional() @IsString() date?: string; }

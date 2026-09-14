import type { ChildGenre } from '@shared/types/child';
import { IsEnum, IsMongoId, IsOptional, Matches } from 'class-validator';
import { AttendanceStatus, ChildAttendanceStatus } from '../entities/attendance.entity';

export class CreateAttendanceDto {
  @IsMongoId() groupId: string;
  @Matches(/^\d{4}-\d{2}-\d{2}$/) date: string;
}

export class AttendanceQueryDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/) date: string;
  @IsOptional() @IsMongoId() kindergartenId?: string;
}

export class SetChildStatusDto {
  @IsEnum(ChildAttendanceStatus)
  status: ChildAttendanceStatus;
}

export class AttendanceSummaryDto {
  id: string | null;
  groupId: string;
  groupName: string;
  date: string;
  status: AttendanceStatus | null;
  childrenCount: number;
  checkedCount: number;
}

export class AttendanceChildDto {
  id: string;
  name: string;
  genre: ChildGenre | null;
  age: number;
  photoKey: string | null;
  status: ChildAttendanceStatus | null;
}

export class AttendanceDetailDto extends AttendanceSummaryDto {
  startedAt: Date | null;
  finishedAt: Date | null;
  children: AttendanceChildDto[];
}

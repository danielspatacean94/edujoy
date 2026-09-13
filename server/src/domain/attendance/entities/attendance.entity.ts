import { Column, CreateDateColumn, Entity, ObjectIdColumn, UpdateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

export enum AttendanceStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
}

export enum ChildAttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
}

@Entity('attendance')
export class Attendance {
  @ObjectIdColumn() _id: ObjectId;
  @Column() groupId: string;
  @Column() kindergartenId: string;
  @Column() date: string;
  @Column() status: AttendanceStatus = AttendanceStatus.PENDING;
  @Column() checkedChildIds: string[] = [];
  @Column() childStatuses: Record<string, ChildAttendanceStatus> = {};
  @Column({ nullable: true, default: null }) startedAt: Date | null = null;
  @Column({ nullable: true, default: null }) finishedAt: Date | null = null;
  @Column() createdBy: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

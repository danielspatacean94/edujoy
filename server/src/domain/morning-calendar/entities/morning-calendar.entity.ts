import { Column, CreateDateColumn, Entity, ObjectIdColumn, UpdateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

export interface MorningCalendarOption { id: string; label: string; image: string; }
export interface MorningCalendarQuestion { id: string; type: 'weekday' | 'weather' | 'season' | 'activity'; label: string; options: MorningCalendarOption[]; }

@Entity('morning_calendar')
export class MorningCalendar {
  @ObjectIdColumn() _id: ObjectId;
  @Column() groupId: string;
  @Column() kindergartenId: string;
  @Column() date: string;
  @Column() questions: MorningCalendarQuestion[] = [];
  @Column() status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' = 'DRAFT';
  @Column({ nullable: true, default: null }) startedAt: Date | null = null;
  @Column({ nullable: true, default: null }) completedAt: Date | null = null;
  @Column() createdBy: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

import { Entity, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('group')
export class Group {
  @ObjectIdColumn() _id: ObjectId;
  @Column() name: string;
  @Column() kindergartenId: string;
  @Column({ nullable: true, default: null }) deletedAt: Date | null = null;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

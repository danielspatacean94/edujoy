import { ChildGenre } from '@shared/types/child';
import { Entity, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';
@Entity('child')
export class Child {
  @ObjectIdColumn() _id: ObjectId;
  @Column()
  name: string;
  @Column()
  age: number;
  @Column({ nullable: true, default: null }) genre: ChildGenre | null = null;
  @Column()
  kindergartenId: string;
  @Column({ nullable: true, default: null }) groupId: string | null = null;
  @Column({ nullable: true, default: null }) photoKey: string | null = null;
  @Column({ nullable: true, default: null }) photoMimeType: string | null = null;
  @Column({ nullable: true, default: null }) deletedAt: Date | null = null;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

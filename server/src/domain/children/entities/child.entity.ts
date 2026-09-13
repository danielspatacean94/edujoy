import { Entity, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';
@Entity('child')
export class Child {
  @ObjectIdColumn() _id: ObjectId;
  @Column()
  name: string;
  @Column()
  age: number;
  @Column()
  kindergartenId: string;
  @Column({ nullable: true, default: null }) deletedAt: Date | null = null;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

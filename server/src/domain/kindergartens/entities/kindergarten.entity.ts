import { Entity, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';
@Entity('kindergarten')
export class Kindergarten {
  @ObjectIdColumn() _id: ObjectId;
  @Column()
  name: string;
  @Column()
  location: string;
  @Column({ nullable: true, default: null }) deletedAt: Date | null = null;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

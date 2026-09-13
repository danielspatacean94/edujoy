import { Entity, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('user')
export class User {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  email: string;

  @Column({ nullable: true, default: null })
  fullName: string | null;

  @Column({ nullable: true, default: null })
  password: string | null;

  @Column()
  role: 'admin' | 'teacher';

  @Column({ nullable: true, default: null })
  passwordExpiresAt: Date | null;

  @Column({ nullable: true, default: null })
  kindergartenId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true, default: null })
  deletedAt: Date | null;

  @Column({ default: 0 })
  tokenVersion: number;
}

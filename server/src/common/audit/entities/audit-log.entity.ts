import { Entity, ObjectIdColumn, Column, CreateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

export type AuditAction = 'INSERT' | 'UPDATE' | 'SOFT_DELETE';

@Entity('audit_log')
export class AuditLog {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ nullable: true })
  userId: string | null;

  @Column({ nullable: true })
  userEmail: string | null;

  @Column({ nullable: true })
  userFullName: string | null;

  @Column()
  action: AuditAction;

  @Column()
  entityType: string;

  @Column({ nullable: true })
  entityId: string | null;

  @Column({ nullable: true })
  entityBefore: Record<string, any> | null;

  @Column({ nullable: true })
  entityAfter: Record<string, any> | null;

  @Column({ nullable: true })
  searchText: string | null;

  @CreateDateColumn()
  createdAt: Date;
}

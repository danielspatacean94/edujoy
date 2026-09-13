import { Entity, ObjectIdColumn, Column, CreateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

// Generic per-user notification. `link` is an optional in-app path the
// frontend navigates to when the notification is clicked (e.g. '/admin/users').
// Domain modules create these via NotificationsService.create() as they're
// built — there is no public "create" HTTP endpoint by design.
@Entity('notification')
export class Notification {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  userId: string;

  @Column()
  title: string;

  @Column({ nullable: true, default: null })
  message: string | null;

  @Column({ nullable: true, default: null })
  link: string | null;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true, default: null })
  deletedAt: Date | null;
}

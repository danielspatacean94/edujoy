import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

// Singleton document: exactly one Settings row ever exists. `global` is an
// open-ended JSON blob for now — give it real, typed fields once app-wide
// config requirements are known.
@Entity('settings')
export class Settings {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ nullable: true, default: null })
  global: Record<string, unknown> | null;
}

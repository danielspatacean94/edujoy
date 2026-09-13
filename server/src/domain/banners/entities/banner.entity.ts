import { Entity, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';
import { BannerStyle } from '@shared/types/banner';

@Entity('banner')
export class Banner {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  message: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  // Drives how Header's BannerStrip renders this banner — a plain bar for
  // 'ANNOUNCEMENT' vs a gradient/animated one for 'CELEBRATION'. Purely
  // presentational, no behavioral difference server-side.
  @Column()
  style: BannerStyle;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true, default: null })
  deletedAt: Date | null;
}

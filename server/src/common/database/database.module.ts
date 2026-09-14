import { Kindergarten } from '../../domain/kindergartens/entities/kindergarten.entity';
import { Child } from '../../domain/children/entities/child.entity';
import { Group } from '../../domain/groups/entities/group.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../../domain/users/entities/user.entity';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { Settings } from '../settings/entities/settings.entity';
import { Notification } from '../../domain/notifications/entities/notification.entity';
import { Banner } from '../../domain/banners/entities/banner.entity';
import { Attendance } from '../../domain/attendance/entities/attendance.entity';
import { MorningCalendar } from '../../domain/morning-calendar/entities/morning-calendar.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mongodb',
        url: config.get<string>('MONGODB_URI'),
        // Register every entity here as domain modules are added.
        entities: [User, AuditLog, Settings, Notification, Banner, Kindergarten, Child, Group, Attendance, MorningCalendar],
        synchronize: true,
      }),
    }),
  ],
})
export class DatabaseModule {}

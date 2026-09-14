import { KindergartensModule } from './domain/kindergartens/kindergartens.module';
import { GroupsModule } from './domain/groups/groups.module';
import { AttendanceModule } from './domain/attendance/attendance.module';
import { MorningCalendarModule } from './domain/morning-calendar/morning-calendar.module';
import { ChildrenModule } from './domain/children/children.module';
import { Module, OnModuleInit } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ClsModule } from 'nestjs-cls';
import { join } from 'path';
import { DatabaseModule } from './common/database/database.module';
import { LoggerModule } from './common/logger/logger.module';
import { AuthModule } from './common/auth/auth.module';
import { CryptoModule } from './common/crypto/crypto.module';
import { S3Module } from './common/s3/s3.module';
import { AuditModule } from './common/audit/audit.module';
import { SettingsModule } from './common/settings/settings.module';
import { UsersModule } from './domain/users/users.module';
import { UsersService } from './domain/users/users.service';
import { NotificationsModule } from './domain/notifications/notifications.module';
import { BannersModule } from './domain/banners/banners.module';
// import each new domain module here as it's created, e.g.:
// import { ClientsModule } from './domain/clients/clients.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    // Global request-scoped context — used to stash the current user so the
    // AuditSubscriber can attribute changes without threading a user param
    // through every service method.
    ClsModule.forRoot({ global: true, middleware: { mount: true } }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', '..', 'dist', 'ui'),
      exclude: ['/api/(.*)'],
    }),
    LoggerModule,
    DatabaseModule,
    AuthModule,
    S3Module,
    AuditModule,
    SettingsModule,
    UsersModule,
    NotificationsModule,
    BannersModule,
    KindergartensModule,
    ChildrenModule,
    GroupsModule,
    AttendanceModule,
    MorningCalendarModule,
    // ClientsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly usersService: UsersService) {}

  async onModuleInit() {
    await this.usersService.seedAdmin();
  }
}

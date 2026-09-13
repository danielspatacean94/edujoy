import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { Child } from '../children/entities/child.entity';
import { KindergartensModule } from '../kindergartens/kindergartens.module';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Group, Child]), KindergartensModule],
  providers: [GroupsService], controllers: [GroupsController], exports: [GroupsService],
})
export class GroupsModule {}

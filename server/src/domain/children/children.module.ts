import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Child } from './entities/child.entity';
import { ChildrenService } from './children.service';
import { ChildrenController } from './children.controller';
import { KindergartensModule } from '../kindergartens/kindergartens.module';
import { GroupsModule } from '../groups/groups.module';
import { S3Module } from '../../common/s3/s3.module';
@Module({
  imports: [TypeOrmModule.forFeature([Child]), KindergartensModule, GroupsModule, S3Module],
  providers: [ChildrenService], controllers: [ChildrenController], exports: [ChildrenService],
})
export class ChildrenModule {}

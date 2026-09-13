import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Child } from './entities/child.entity';
import { ChildrenService } from './children.service';
import { ChildrenController } from './children.controller';
import { KindergartensModule } from '../kindergartens/kindergartens.module';
@Module({
  imports: [TypeOrmModule.forFeature([Child]), KindergartensModule],
  providers: [ChildrenService], controllers: [ChildrenController], exports: [ChildrenService],
})
export class ChildrenModule {}

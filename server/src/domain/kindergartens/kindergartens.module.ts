import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kindergarten } from './entities/kindergarten.entity';
import { KindergartensService } from './kindergartens.service';
import { KindergartensController } from './kindergartens.controller';
import { User } from '../users/entities/user.entity'; import { Child } from '../children/entities/child.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Kindergarten, User, Child])],
  providers: [KindergartensService], controllers: [KindergartensController], exports: [KindergartensService],
})
export class KindergartensModule {}

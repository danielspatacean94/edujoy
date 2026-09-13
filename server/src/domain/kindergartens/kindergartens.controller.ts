import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { KindergartensService } from './kindergartens.service';
import { SaveKindergartenDto } from './dto/kindergarten.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';
@Controller('kindergartens')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
export class KindergartensController {
  constructor(private readonly service: KindergartensService) {}
  @Get() findAll(@Query() query: PaginationQueryDto) { return this.service.findAll(query); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() create(@Body() dto: SaveKindergartenDto) { return this.service.create(dto); }
  @Put(':id') update(@Param('id') id: string, @Body() dto: SaveKindergartenDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}

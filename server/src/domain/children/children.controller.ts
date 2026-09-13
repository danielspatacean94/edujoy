import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ChildrenService } from './children.service';
import { SaveChildDto } from './dto/child.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';
@Controller('children')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin", "teacher")
export class ChildrenController {
  constructor(private readonly service: ChildrenService) {}
  @Get() findAll(@Query() query: PaginationQueryDto, @CurrentUser() user: AuthenticatedUser) { return this.service.findAll(query, user); }
  @Get(':id') findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.findOne(id, user); }
  @Post() create(@Body() dto: SaveChildDto, @CurrentUser() user: AuthenticatedUser) { return this.service.create(dto, user); }
  @Put(':id') update(@Param('id') id: string, @Body() dto: SaveChildDto, @CurrentUser() user: AuthenticatedUser) { return this.service.update(id, dto, user); }
  @Delete(':id') remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.remove(id, user); }
}

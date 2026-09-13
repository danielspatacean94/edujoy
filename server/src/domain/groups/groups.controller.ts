import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { SaveGroupDto, GroupQueryDto } from './dto/group.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';

@Controller('groups')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'teacher')
export class GroupsController {
  constructor(private readonly service: GroupsService) {}
  @Get() findAll(@Query() query: GroupQueryDto, @CurrentUser() user: AuthenticatedUser) { return this.service.findAll(query, user); }
  @Get(':id') findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.findOne(id, user); }
  @Post() create(@Body() dto: SaveGroupDto, @CurrentUser() user: AuthenticatedUser) { return this.service.create(dto, user); }
  @Put(':id') update(@Param('id') id: string, @Body() dto: SaveGroupDto, @CurrentUser() user: AuthenticatedUser) { return this.service.update(id, dto, user); }
  @Delete(':id') remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.remove(id, user); }
}

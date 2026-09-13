import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';
import { AttendanceService } from './attendance.service';
import { AttendanceQueryDto, CreateAttendanceDto, SetChildStatusDto } from './dto/attendance.dto';

@Controller('attendances')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'teacher')
export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}

  @Get()
  findAll(@Query() query: AttendanceQueryDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.findAll(query, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.findOne(id, user);
  }

  @Post()
  create(@Body() dto: CreateAttendanceDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(dto, user);
  }

  @Post(':id/start')
  start(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.start(id, user);
  }

  @Post(':id/children/:childId/status')
  setChildStatus(@Param('id') id: string, @Param('childId') childId: string, @Body() dto: SetChildStatusDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.setChildStatus(id, childId, dto.status, user);
  }

  @Post(':id/finish')
  finish(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.finish(id, user);
  }

  @Post(':id/reset')
  reset(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.reset(id, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.remove(id, user);
  }
}

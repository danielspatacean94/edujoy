import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';
import { MorningCalendarQueryDto, SaveMorningCalendarDto } from './dto/morning-calendar.dto';
import { MorningCalendarService } from './morning-calendar.service';
@Controller('morning-calendars') @UseGuards(JwtAuthGuard, RolesGuard)
export class MorningCalendarController {
  constructor(private readonly service: MorningCalendarService) {}
  @Get() find(@Query() query: MorningCalendarQueryDto, @CurrentUser() user: AuthenticatedUser) { return this.service.find(query, user); }
  @Post() save(@Body() dto: SaveMorningCalendarDto, @CurrentUser() user: AuthenticatedUser) { return this.service.save(dto, user); }
  @Post(':id/start') start(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.start(id, user); }
  @Post(':id/complete') complete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.complete(id, user); }
}

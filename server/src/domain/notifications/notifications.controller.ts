import { Controller, Get, Patch, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';

// Every route here is scoped to the current user — there's no admin
// override, since notifications are personal, not shared platform data.
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findRecent(@CurrentUser() user: AuthenticatedUser, @Query('limit') limit?: string) {
    return this.notificationsService.findRecent(user.userId, limit ? parseInt(limit, 10) : undefined);
  }

  // Default view shown by the header bell.
  @Get('today')
  findForToday(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.findForToday(user.userId);
  }

  @Patch('read-all')
  markAllRead(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.markAllRead(user.userId);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.markAsRead(id, user.userId);
  }

  @Delete(':id')
  deleteOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.deleteOne(id, user.userId);
  }
}

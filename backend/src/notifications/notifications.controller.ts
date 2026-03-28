import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../shared/decorators/user.decorator';

@Controller('api/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(
    @CurrentUser() user: any,
    @Query('skip') skip?: number,
    @Query('take') take = 20,
    @Query('isRead') isRead?: boolean,
  ) {
    return this.notificationsService.getUserNotifications(
      user.id,
      skip ? parseInt(skip as any, 10) : undefined,
      take,
      isRead !== undefined ? isRead : undefined,
    );
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: any) {
    return {
      count: await this.notificationsService.getUnreadCount(user.id),
    };
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    await this.notificationsService.markAsRead(id);
    return { success: true };
  }

  @Patch('read-all')
  async markAllAsRead(@CurrentUser() user: any) {
    await this.notificationsService.markAllAsRead(user.id);
    return { success: true };
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: string) {
    await this.notificationsService.deleteNotification(id);
    return { success: true };
  }
}

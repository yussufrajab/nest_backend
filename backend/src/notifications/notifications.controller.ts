import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  Post,
  Body,
} from '@nestjs/common';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
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

  /**
   * Test endpoint for email functionality (admin only)
   */
  @Post('test-email')
  @UseGuards(RolesGuard)
  @Roles('Admin')
  async testEmail(
    @CurrentUser() user: any,
    @Body('email') email?: string,
  ) {
    const testEmail = email || user.email;
    if (!testEmail) {
      return { success: false, message: 'No email provided' };
    }

    await this.notificationsService.sendPasswordResetEmail(user.id, '123456', 15);

    return {
      success: true,
      message: `Test email sent to ${testEmail}`,
      emailEnabled: this.notificationsService.isEmailEnabled(),
    };
  }

  /**
   * Check email configuration status
   */
  @Get('email-status')
  emailStatus() {
    return {
      enabled: this.notificationsService.isEmailEnabled(),
    };
  }
}

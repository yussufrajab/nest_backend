import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

export interface NotificationDto {
  userId: string;
  message: string;
  link?: string;
}

@Injectable()
export class NotificationsService {
  private smtpConfig: any;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.smtpConfig = {
      host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get('SMTP_PORT', 587),
      secure: this.configService.get('SMTP_SECURE', 'false') === 'true',
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    };
  }

  /**
   * Create in-app notification
   */
  async createNotification(dto: NotificationDto): Promise<void> {
    await this.prisma.notification.create({
      data: {
        id: crypto.randomUUID(),
        userId: dto.userId,
        message: dto.message,
        link: dto.link || null,
        isRead: false,
      },
    });
  }

  /**
   * Send notification (in-app + email)
   */
  async sendNotification(
    userId: string,
    message: string,
    link?: string,
    sendEmail: boolean = true,
  ): Promise<void> {
    // Create in-app notification
    await this.createNotification({ userId, message, link });

    // Send email if enabled
    if (sendEmail) {
      await this.sendEmailNotification(userId, message, link);
    }
  }

  /**
   * Send request submitted notification to approver
   */
  async sendRequestSubmittedNotification(
    approverId: string,
    requestType: string,
    requestId: string,
    employeeName: string,
    institutionName: string,
    submittedByName: string,
  ): Promise<void> {
    const message = `New ${requestType} request for ${employeeName} from ${institutionName}`;
    const link = `/requests/${requestType.toLowerCase()}/${requestId}`;

    await this.sendNotification(approverId, message, link);
  }

  /**
   * Send request approved notification to HRO
   */
  async sendRequestApprovedNotification(
    hroId: string,
    requestType: string,
    requestId: string,
    employeeName: string,
  ): Promise<void> {
    const message = `Your ${requestType} request for ${employeeName} has been APPROVED`;
    const link = `/requests/${requestType.toLowerCase()}/${requestId}`;

    await this.sendNotification(hroId, message, link);

    // Send email
    const email = await this.getUserEmail(hroId);
    if (email) {
      await this.sendEmail({
        to: email,
        subject: `[CSMS] Request Approved - ${requestType} Request ${requestId}`,
        template: 'request-approved',
        data: {
          requestType,
          requestId,
          employeeName,
        },
      });
    }
  }

  /**
   * Send request rejected notification to HRO
   */
  async sendRequestRejectedNotification(
    hroId: string,
    requestType: string,
    requestId: string,
    employeeName: string,
    rejectionReason: string,
  ): Promise<void> {
    const message = `Your ${requestType} request for ${employeeName} has been REJECTED`;
    const link = `/requests/${requestType.toLowerCase()}/${requestId}`;

    await this.sendNotification(hroId, message, link);

    // Send email
    const email = await this.getUserEmail(hroId);
    if (email) {
      await this.sendEmail({
        to: email,
        subject: `[CSMS] Request Rejected - ${requestType} Request ${requestId}`,
        template: 'request-rejected',
        data: {
          requestType,
          requestId,
          employeeName,
          rejectionReason,
        },
      });
    }
  }

  /**
   * Send request sent-back notification to HRO
   */
  async sendRequestSentBackNotification(
    hroId: string,
    requestType: string,
    requestId: string,
    employeeName: string,
    instructions: string,
  ): Promise<void> {
    const message = `Your ${requestType} request for ${employeeName} needs rectification`;
    const link = `/requests/${requestType.toLowerCase()}/${requestId}`;

    await this.sendNotification(hroId, message, link);

    // Send email
    const email = await this.getUserEmail(hroId);
    if (email) {
      await this.sendEmail({
        to: email,
        subject: `[CSMS] Request Needs Rectification - ${requestType} Request ${requestId}`,
        template: 'request-sent-back',
        data: {
          requestType,
          requestId,
          employeeName,
          instructions,
        },
      });
    }
  }

  /**
   * Send complaint resolved notification to employee
   */
  async sendComplaintResolvedNotification(
    employeeId: string,
    complaintId: string,
    status: string,
  ): Promise<void> {
    const message = `Your complaint has been ${status.toLowerCase()}`;
    const link = `/complaints/${complaintId}`;

    await this.sendNotification(employeeId, message, link);
  }

  /**
   * Get user's unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  /**
   * Get user's notifications
   */
  async getUserNotifications(
    userId: string,
    skip?: number,
    take?: number,
    isRead?: boolean,
  ) {
    const where: any = { userId };
    if (isRead !== undefined) where.isRead = isRead;

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await this.prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  /**
   * Send email (placeholder - implement with nodemailer or similar)
   */
  private async sendEmail(params: {
    to: string | null;
    subject: string;
    template: string;
    data: any;
  }): Promise<void> {
    // TODO: Implement with nodemailer or SMTP service
    // For now, just log the email
    console.log(`[Email] To: ${params.to}, Subject: ${params.subject}`);
  }

  /**
   * Send email notification (generic)
   */
  private async sendEmailNotification(
    userId: string,
    message: string,
    link?: string,
  ): Promise<void> {
    const email = await this.getUserEmail(userId);
    if (email) {
      console.log(`[Email] To: ${email}, Message: ${message}`);
    }
  }

  /**
   * Get user email
   */
  private async getUserEmail(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    return user?.email || null;
  }
}

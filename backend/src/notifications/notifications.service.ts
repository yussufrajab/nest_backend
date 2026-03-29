import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';
import {
  getRequestApprovedEmail,
  getRequestRejectedEmail,
  getRequestSentBackEmail,
  getComplaintResolvedEmail,
  getPasswordResetEmail,
  getRequestSubmittedEmail,
} from './templates';

export interface NotificationDto {
  userId: string;
  message: string;
  link?: string;
}

@Injectable()
export class NotificationsService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(NotificationsService.name);
  private emailEnabled: boolean;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.emailEnabled = this.configService.get('SMTP_USER') !== undefined &&
                       this.configService.get('SMTP_USER') !== 'your-email@gmail.com';

    if (this.emailEnabled) {
      this.transporter = nodemailer.createTransport({
        host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
        port: this.configService.get('SMTP_PORT', 587),
        secure: this.configService.get('SMTP_SECURE', 'false') === 'true',
        auth: {
          user: this.configService.get('SMTP_USER'),
          pass: this.configService.get('SMTP_PASS'),
        },
      });

      // Verify connection configuration
      this.verifyConnection();
    } else {
      this.logger.warn('Email notifications disabled - SMTP credentials not configured');
    }
  }

  /**
   * Verify SMTP connection
   */
  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified successfully');
    } catch (error) {
      this.logger.error('SMTP connection failed:', error.message);
      this.emailEnabled = false;
    }
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
    if (sendEmail && this.emailEnabled) {
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

    await this.sendNotification(approverId, message, link, false);

    // Send email
    if (this.emailEnabled) {
      const approver = await this.getUserEmail(approverId);
      if (approver) {
        const { subject, html } = getRequestSubmittedEmail({
          requestType,
          requestId,
          employeeName,
          submittedBy: submittedByName,
          institution: institutionName,
          link,
        });
        await this.sendEmail({
          to: approver,
          subject,
          html,
        });
      }
    }
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
    if (email && this.emailEnabled) {
      const { subject, html } = getRequestApprovedEmail({
        requestType,
        requestId,
        employeeName,
        approvedBy: 'HR Management',
        approvedDate: new Date().toLocaleDateString(),
        link,
      });
      await this.sendEmail({
        to: email,
        subject,
        html,
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
    if (email && this.emailEnabled) {
      const { subject, html } = getRequestRejectedEmail({
        requestType,
        requestId,
        employeeName,
        rejectedBy: 'HR Management',
        rejectionReason,
        link,
      });
      await this.sendEmail({
        to: email,
        subject,
        html,
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
    if (email && this.emailEnabled) {
      const { subject, html } = getRequestSentBackEmail({
        requestType,
        requestId,
        employeeName,
        sentBackBy: 'HR Management',
        instructions,
        link,
      });
      await this.sendEmail({
        to: email,
        subject,
        html,
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
    subject?: string,
    resolution?: string,
  ): Promise<void> {
    const message = `Your complaint has been ${status.toLowerCase()}`;
    const link = `/complaints/${complaintId}`;

    await this.sendNotification(employeeId, message, link);

    // Send email
    const email = await this.getUserEmail(employeeId);
    if (email && this.emailEnabled) {
      const { subject: emailSubject, html } = getComplaintResolvedEmail({
        complaintId,
        subject: subject || 'Complaint',
        status,
        resolution: resolution || `Your complaint has been ${status.toLowerCase()}.`,
        link,
      });
      await this.sendEmail({
        to: email,
        subject: emailSubject,
        html,
      });
    }
  }

  /**
   * Send password reset OTP email
   */
  async sendPasswordResetEmail(
    userId: string,
    otp: string,
    expiryMinutes: number = 15,
  ): Promise<void> {
    const email = await this.getUserEmail(userId);
    if (email && this.emailEnabled) {
      const { subject, html } = getPasswordResetEmail({
        otp,
        expiryMinutes,
      });
      await this.sendEmail({
        to: email,
        subject,
        html,
      });
    }
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
   * Send email using nodemailer
   */
  private async sendEmail(params: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    if (!this.emailEnabled) {
      this.logger.log(`[Email Disabled] Would send to: ${params.to}, Subject: ${params.subject}`);
      return;
    }

    try {
      const from = this.configService.get('EMAIL_FROM', 'CSMS <noreply@csms.gov.zm>');

      await this.transporter.sendMail({
        from,
        to: params.to,
        subject: params.subject,
        html: params.html,
      });

      this.logger.log(`Email sent successfully to: ${params.to}, Subject: ${params.subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${params.to}:`, error.message);
      throw error;
    }
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
    if (email && this.emailEnabled) {
      await this.sendEmail({
        to: email,
        subject: '[CSMS] Notification',
        html: `<p>${message}</p>${link ? `<p><a href="${link}">View Details</a></p>` : ''}`,
      });
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

  /**
   * Check if email is enabled and configured
   */
  isEmailEnabled(): boolean {
    return this.emailEnabled;
  }
}

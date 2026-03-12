import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { LoggerService } from '../common/logger/logger.service';
import { EmailTemplates } from './templates/email.templates';
import { ConfigService } from 'config/config.service';

// Define Attachment type locally since it's not exported
type Attachment = {
  filename?: string;
  content?: any;
  path?: string;
  href?: string;
  contentType?: string;
  cid?: string;
  encoding?: string;
};

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private templates: EmailTemplates;

  constructor(
    private config: ConfigService,
    private logger: LoggerService,
  ) {
    this.templates = new EmailTemplates(this.config);
    this.initializeTransporter();
  }

  private initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: this.config.email.host,
        port: this.config.email.port,
        secure: this.config.email.secure,
        auth: {
          user: this.config.email.auth.user,
          pass: this.config.email.auth.pass,
        },
        tls: {
          rejectUnauthorized: this.config.isProduction,
        },
      });

      // Verify connection
      this.transporter.verify((error: any) => {
        if (error) {
          this.logger.error(
            'Email transporter verification failed',
            error.stack,
            'EmailService',
          );
        } else {
          this.logger.log(
            'Email transporter is ready to send messages',
            'EmailService',
          );
        }
      });
    } catch (error) {
      this.logger.error(
        'Failed to initialize email transporter',
        error.stack,
        'EmailService',
      );
    }
  }

  private async sendMail(options: {
    to: string | string[];
    subject: string;
    html: string;
    text: string;
    cc?: string | string[];
    bcc?: string | string[];
    attachments?: Attachment[];
  }) {
    try {
      const recipients = Array.isArray(options.to)
        ? options.to.join(', ')
        : options.to;

      const mailOptions: nodemailer.SendMailOptions = {
        from: `"${this.config.email.from.name}" <${this.config.email.from.address}>`,
        to: recipients,
        subject: options.subject,
        html: options.html,
        text: options.text,
        cc: options.cc,
        bcc: options.bcc,
        attachments: options.attachments as any,
      };

      // Log that email is being sent (without showing full HTML)
      this.logger.log(
        `📧 Sending email to ${recipients} - Subject: ${options.subject}`,
        'EmailService',
      );

      // Actually send the email in ALL environments
      const info = await this.transporter.sendMail(mailOptions);

      this.logger.log(
        `✅ Email sent successfully to ${recipients} - MessageId: ${info.messageId}`,
        'EmailService',
      );

      return {
        success: true,
        messageId: info.messageId,
        response: info.response,
      };
    } catch (error) {
      this.logger.error('Failed to send email', error.stack, 'EmailService');
      throw error;
    }
  }

  // Send verification email (combined for both user and admin)
  async sendVerificationEmail(params: {
    email: string;
    name: string;
    otp: string;
    ipAddress?: string;
    location?: string;
    userAgent?: string;
    isAdmin?: boolean; // Add isAdmin parameter
  }) {
    const template = this.templates.getVerificationEmailTemplate({
      name: params.name,
      otp: params.otp,
      email: params.email,
      ipAddress: params.ipAddress,
      location: params.location,
      userAgent: params.userAgent,
      isAdmin: params.isAdmin || false,
    });

    return this.sendMail({
      to: params.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Keep for backward compatibility but delegate to sendVerificationEmail
  async sendAdminVerificationEmail(params: {
    email: string;
    name: string;
    otp: string;
    ipAddress?: string;
    location?: string;
    userAgent?: string;
  }) {
    return this.sendVerificationEmail({
      ...params,
      isAdmin: true,
    });
  }

  // Send welcome email to user
  async sendWelcomeEmail(params: {
    email: string;
    name: string;
    isAdmin?: boolean;
  }) {
    const template = this.templates.getWelcomeEmailTemplate({
      name: params.name,
      email: params.email,
      isAdmin: params.isAdmin || false,
    });

    return this.sendMail({
      to: params.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Send password reset email
  async sendPasswordResetEmail(params: {
    email: string;
    name: string;
    resetLink: string;
    ipAddress?: string;
    location?: string;
    userAgent?: string;
  }) {
    const template = this.templates.getPasswordResetEmailTemplate({
      name: params.name,
      email: params.email,
      resetLink: params.resetLink,
      ipAddress: params.ipAddress,
      location: params.location,
      userAgent: params.userAgent,
    });

    return this.sendMail({
      to: params.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Send password changed confirmation
  async sendPasswordChangedEmail(params: {
    email: string;
    name: string;
    ipAddress?: string;
    location?: string;
  }) {
    const template = this.templates.getPasswordChangedConfirmationTemplate({
      name: params.name,
      email: params.email,
      ipAddress: params.ipAddress,
      location: params.location,
    });

    return this.sendMail({
      to: params.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Send login notification
  async sendLoginNotification(params: {
    email: string;
    name: string;
    ipAddress: string;
    location: string;
    userAgent: string;
    time: Date;
  }) {
    const template = this.templates.getLoginNotificationTemplate(params);

    return this.sendMail({
      to: params.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Send custom email
  async sendCustomEmail(params: {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    cc?: string | string[];
    bcc?: string | string[];
    attachments?: Attachment[];
  }) {
    return this.sendMail({
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text || params.html.replace(/<[^>]*>/g, ''),
      cc: params.cc,
      bcc: params.bcc,
      attachments: params.attachments,
    });
  }
}

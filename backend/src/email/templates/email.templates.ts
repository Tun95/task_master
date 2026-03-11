import { ConfigService } from 'config/config.service';

export class EmailTemplates {
  constructor(private config: ConfigService) {}

  // Verification Email Template (for both User and Admin)
  getVerificationEmailTemplate(params: {
    name: string;
    otp: string;
    email: string;
    ipAddress?: string;
    location?: string;
    userAgent?: string;
    isAdmin?: boolean;
  }): { subject: string; html: string; text: string } {
    const { name, otp, email, ipAddress, location, userAgent, isAdmin } =
      params;
    const year = new Date().getFullYear();
    const loginUrl = isAdmin
      ? this.config.adminFrontendUrl
      : this.config.frontendUrl;
    const role = isAdmin ? 'Administrator' : 'User';

    const subject = isAdmin
      ? `🔐 Verify Your TaskMaster Admin Account - OTP: ${otp}`
      : `🔐 Welcome to TaskMaster! Verify Your Email - OTP: ${otp}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - TaskMaster</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f7fc;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, ${isAdmin ? '#7c3aed' : '#2563eb'} 0%, ${isAdmin ? '#c026d3' : '#1e40af'} 100%);
            padding: 40px 30px;
            text-align: center;
          }
          .logo {
            font-size: 32px;
            font-weight: 800;
            color: white;
            margin-bottom: 10px;
            letter-spacing: -0.5px;
          }
          .badge {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            padding: 6px 16px;
            border-radius: 30px;
            font-size: 14px;
            font-weight: 600;
            display: inline-block;
          }
          .content {
            padding: 40px 30px;
            line-height: 1.6;
          }
          .otp-container {
            background: #f8fafc;
            border: 2px dashed ${isAdmin ? '#c026d3' : '#2563eb'};
            padding: 30px;
            margin: 30px 0;
            text-align: center;
            border-radius: 12px;
          }
          .otp-code {
            font-size: 48px;
            font-weight: 800;
            color: ${isAdmin ? '#7c3aed' : '#2563eb'};
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            margin: 15px 0;
          }
          .info-box {
            background: #f1f5f9;
            padding: 20px;
            border-radius: 10px;
            margin: 25px 0;
            font-size: 14px;
            border-left: 4px solid ${isAdmin ? '#7c3aed' : '#2563eb'};
          }
          .info-item {
            margin: 8px 0;
            color: #475569;
          }
          .info-label {
            font-weight: 600;
            color: #1e293b;
            display: inline-block;
            width: 80px;
          }
          .button {
            display: inline-block;
            background: ${isAdmin ? '#7c3aed' : '#2563eb'};
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 15px 0;
          }
          .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            font-size: 14px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
          }
          .social-links {
            margin: 20px 0;
          }
          .social-link {
            display: inline-block;
            margin: 0 10px;
            color: #64748b;
            text-decoration: none;
          }
          .security-note {
            background: #fff7ed;
            border: 1px solid #fed7aa;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            font-size: 13px;
          }
          hr {
            border: none;
            border-top: 1px solid #e2e8f0;
            margin: 25px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">✨ TaskMaster</div>
            <div class="badge">${role} Verification</div>
          </div>
          
          <div class="content">
            <h2 style="color: #1e293b; margin-bottom: 20px;">Hello ${name},</h2>
            
            <p style="font-size: 16px; color: #475569;">
              Thank you for ${isAdmin ? 'registering as an administrator' : 'joining TaskMaster'}! 
              Please use the verification code below to complete your email verification.
            </p>

            <div class="otp-container">
              <div style="color: #64748b; font-size: 14px; margin-bottom: 10px;">Your verification code</div>
              <div class="otp-code">${otp}</div>
              <div style="color: #94a3b8; font-size: 14px; margin-top: 10px;">
                ⏰ This code expires in 30 minutes
              </div>
            </div>

            <div class="info-box">
              <h4 style="color: #1e293b; margin: 0 0 15px 0;">📋 Request Details</h4>
              <div class="info-item">
                <span class="info-label">Email:</span> ${email}
              </div>
              ${
                ipAddress
                  ? `
              <div class="info-item">
                <span class="info-label">IP Address:</span> ${ipAddress}
              </div>
              `
                  : ''
              }
              ${
                location
                  ? `
              <div class="info-item">
                <span class="info-label">Location:</span> ${location}
              </div>
              `
                  : ''
              }
              ${
                userAgent
                  ? `
              <div class="info-item">
                <span class="info-label">Device:</span> ${userAgent.substring(0, 60)}...
              </div>
              `
                  : ''
              }
              <div class="info-item">
                <span class="info-label">Time:</span> ${new Date().toLocaleString()}
              </div>
            </div>

            <div class="security-note">
              <strong>🔒 Security Tip:</strong> Never share this verification code with anyone. 
              TaskMaster will never ask for your code via phone, email, or chat.
            </div>

            <p style="color: #475569;">
              If you didn't request this verification, please ignore this email or 
              <a href="mailto:${this.config.company.supportEmail}" style="color: #2563eb;">contact support</a> 
              if you're concerned about your account security.
            </p>

            <hr>

            <div style="text-align: center;">
              <a href="${loginUrl}" class="button">
                ${isAdmin ? 'Go to Admin Portal' : 'Go to Dashboard'}
              </a>
            </div>
          </div>

          <div class="footer">
            <p style="margin: 0 0 15px 0; font-weight: 600; color: #1e293b;">${this.config.company.name}</p>
            <p style="margin: 5px 0;">
              ${this.config.company.address}
            </p>
            <p style="margin: 5px 0;">
              📧 ${this.config.company.supportEmail} | 📞 ${this.config.company.contactPhone}
            </p>
            
            <div class="social-links">
              <a href="${this.config.social.facebook}" class="social-link">Facebook</a> •
              <a href="${this.config.social.twitter}" class="social-link">Twitter</a> •
              <a href="${this.config.social.linkedin}" class="social-link">LinkedIn</a> •
              <a href="${this.config.social.instagram}" class="social-link">Instagram</a>
            </div>

            <p style="margin: 15px 0 0 0; font-size: 12px; color: #94a3b8;">
              © ${year} ${this.config.company.name}. All rights reserved.
            </p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #94a3b8;">
              <a href="${this.config.company.website}/privacy" style="color: #94a3b8;">Privacy Policy</a> •
              <a href="${this.config.company.website}/terms" style="color: #94a3b8;">Terms of Service</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Hello ${name},

Thank you for ${isAdmin ? 'registering as an administrator' : 'joining TaskMaster'}! 
Your verification code is: ${otp}

This code expires in 30 minutes.

Request Details:
- Email: ${email}
${ipAddress ? `- IP Address: ${ipAddress}` : ''}
${location ? `- Location: ${location}` : ''}
${userAgent ? `- Device: ${userAgent}` : ''}
- Time: ${new Date().toLocaleString()}

Security Tip: Never share this verification code with anyone. TaskMaster will never ask for your code.

If you didn't request this verification, please ignore this email.

Best regards,
The TaskMaster Team

${this.config.company.name}
${this.config.company.address}
Support: ${this.config.company.supportEmail}
Phone: ${this.config.company.contactPhone}

© ${new Date().getFullYear()} ${this.config.company.name}. All rights reserved.
    `;

    return { subject, html, text };
  }

  // Welcome Email Template
  getWelcomeEmailTemplate(params: {
    name: string;
    email: string;
    isAdmin?: boolean;
    loginUrl?: string;
  }): { subject: string; html: string; text: string } {
    const { name, isAdmin, loginUrl } = params;
    const year = new Date().getFullYear();
    const dashboardUrl =
      loginUrl ||
      (isAdmin ? this.config.adminFrontendUrl : this.config.frontendUrl);
    const role = isAdmin ? 'Administrator' : 'User';

    const subject = isAdmin
      ? `🎉 Welcome to TaskMaster Admin Portal, ${name}!`
      : `🎉 Welcome to TaskMaster, ${name}! Your Account is Ready`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to TaskMaster</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f7fc;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, ${isAdmin ? '#7c3aed' : '#10b981'} 0%, ${isAdmin ? '#c026d3' : '#059669'} 100%);
            padding: 50px 30px;
            text-align: center;
          }
          .logo {
            font-size: 48px;
            font-weight: 800;
            color: white;
            margin-bottom: 15px;
          }
          .badge {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            padding: 8px 20px;
            border-radius: 30px;
            font-size: 16px;
            font-weight: 600;
            display: inline-block;
          }
          .content {
            padding: 40px 30px;
            line-height: 1.6;
          }
          .welcome-icon {
            font-size: 64px;
            text-align: center;
            margin: 20px 0;
          }
          .feature-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin: 30px 0;
          }
          .feature-item {
            background: #f8fafc;
            padding: 15px;
            border-radius: 10px;
            text-align: center;
          }
          .feature-icon {
            font-size: 24px;
            margin-bottom: 8px;
          }
          .button {
            display: inline-block;
            background: ${isAdmin ? '#7c3aed' : '#10b981'};
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
          }
          .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            font-size: 14px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">✨ TaskMaster</div>
            <div class="badge">Welcome, ${role}!</div>
          </div>
          
          <div class="content">
            <div class="welcome-icon">🎉</div>
            
            <h2 style="color: #1e293b; text-align: center; margin-bottom: 20px;">
              Hello ${name}!
            </h2>
            
            <p style="font-size: 16px; color: #475569; text-align: center;">
              Your email has been successfully verified. Welcome to TaskMaster!
            </p>

            <div class="feature-grid">
              <div class="feature-item">
                <div class="feature-icon">📊</div>
                <strong>Dashboard</strong>
                <p style="font-size: 12px; color: #64748b; margin: 5px 0 0;">Track everything</p>
              </div>
              <div class="feature-item">
                <div class="feature-icon">👥</div>
                <strong>Team</strong>
                <p style="font-size: 12px; color: #64748b; margin: 5px 0 0;">Collaborate</p>
              </div>
              <div class="feature-item">
                <div class="feature-icon">📁</div>
                <strong>Projects</strong>
                <p style="font-size: 12px; color: #64748b; margin: 5px 0 0;">Manage work</p>
              </div>
              <div class="feature-item">
                <div class="feature-icon">⚡</div>
                <strong>Analytics</strong>
                <p style="font-size: 12px; color: #64748b; margin: 5px 0 0;">Insights</p>
              </div>
            </div>

            <div style="text-align: center;">
              <a href="${dashboardUrl}" class="button">
                Go to ${isAdmin ? 'Admin Dashboard' : 'Dashboard'}
              </a>
            </div>

            <p style="color: #475569; font-size: 14px; text-align: center; margin-top: 25px;">
              Need help getting started? Check out our 
              <a href="${this.config.company.website}/guides" style="color: #2563eb;">Getting Started Guide</a>
            </p>
          </div>

          <div class="footer">
            <p style="margin: 0 0 15px 0;">${this.config.company.name}</p>
            <p style="margin: 5px 0;">
              Questions? Contact us at <a href="mailto:${this.config.company.supportEmail}">${this.config.company.supportEmail}</a>
            </p>
            <p style="margin: 15px 0 0 0; font-size: 12px;">
              © ${year} ${this.config.company.name}. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Welcome to TaskMaster, ${name}!

Your email has been successfully verified. We're excited to have you onboard!

Get started by logging into your dashboard:
${dashboardUrl}

Need help? Contact our support team at ${this.config.company.supportEmail}

Best regards,
The TaskMaster Team
    `;

    return { subject, html, text };
  }

  // Password Reset Email Template
  getPasswordResetEmailTemplate(params: {
    name: string;
    email: string;
    resetLink: string;
    ipAddress?: string;
    location?: string;
    userAgent?: string;
  }): { subject: string; html: string; text: string } {
    const { name, email, resetLink, ipAddress, location, userAgent } = params;
    const year = new Date().getFullYear();

    const subject = `🔒 Password Reset Request - TaskMaster`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - TaskMaster</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f7fc;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #f59e0b 0%, #dc2626 100%);
            padding: 40px 30px;
            text-align: center;
          }
          .logo {
            font-size: 32px;
            font-weight: 800;
            color: white;
          }
          .content {
            padding: 40px 30px;
          }
          .warning-box {
            background: #fef3c7;
            border: 1px solid #fde68a;
            padding: 20px;
            border-radius: 10px;
            margin: 25px 0;
          }
          .button {
            display: inline-block;
            background: #f59e0b;
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
          }
          .info-box {
            background: #f1f5f9;
            padding: 20px;
            border-radius: 10px;
            margin: 25px 0;
            font-size: 14px;
          }
          .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            font-size: 14px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🔒 TaskMaster</div>
          </div>
          
          <div class="content">
            <h2 style="color: #1e293b;">Hello ${name},</h2>
            
            <p>We received a request to reset your password for your TaskMaster account.</p>

            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Reset Your Password</a>
            </div>

            <div class="warning-box">
              <strong>⚠️ This link expires in 1 hour</strong>
              <p style="margin: 10px 0 0 0; font-size: 14px;">
                If you didn't request a password reset, please ignore this email or 
                <a href="mailto:${this.config.company.supportEmail}" style="color: #2563eb;">contact support</a> immediately.
              </p>
            </div>

            <div class="info-box">
              <h4 style="margin: 0 0 15px 0;">Request Details:</h4>
              <p><strong>Email:</strong> ${email}</p>
              ${ipAddress ? `<p><strong>IP Address:</strong> ${ipAddress}</p>` : ''}
              ${location ? `<p><strong>Location:</strong> ${location}</p>` : ''}
              ${userAgent ? `<p><strong>Device:</strong> ${userAgent.substring(0, 60)}...</p>` : ''}
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <p style="color: #64748b; font-size: 14px;">
              If you didn't make this request, someone else might be trying to access your account. 
              Please secure your account by enabling two-factor authentication.
            </p>
          </div>

          <div class="footer">
            <p>© ${year} ${this.config.company.name}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Hello ${name},

We received a request to reset your TaskMaster password.

Click the link below to reset your password (expires in 1 hour):
${resetLink}

Request Details:
- Email: ${email}
${ipAddress ? `- IP Address: ${ipAddress}` : ''}
${location ? `- Location: ${location}` : ''}
${userAgent ? `- Device: ${userAgent}` : ''}
- Time: ${new Date().toLocaleString()}

If you didn't request this, please ignore this email and ensure your account is secure.

Need help? Contact support: ${this.config.company.supportEmail}

Best regards,
TaskMaster Security Team
    `;

    return { subject, html, text };
  }

  // Password Changed Confirmation Template
  getPasswordChangedConfirmationTemplate(params: {
    name: string;
    email: string;
    ipAddress?: string;
    location?: string;
  }): { subject: string; html: string; text: string } {
    const { name, email, ipAddress, location } = params;
    const year = new Date().getFullYear();

    const subject = `✅ Your TaskMaster Password Has Been Changed`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed - TaskMaster</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f7fc;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 40px 30px;
            text-align: center;
          }
          .logo {
            font-size: 32px;
            font-weight: 800;
            color: white;
          }
          .content {
            padding: 40px 30px;
          }
          .success-icon {
            font-size: 48px;
            text-align: center;
            margin: 20px 0;
          }
          .info-box {
            background: #f1f5f9;
            padding: 20px;
            border-radius: 10px;
            margin: 25px 0;
          }
          .warning-box {
            background: #fff7ed;
            border: 1px solid #fed7aa;
            padding: 20px;
            border-radius: 10px;
            margin: 25px 0;
          }
          .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            font-size: 14px;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">✅ TaskMaster</div>
          </div>
          
          <div class="content">
            <div class="success-icon">🔒</div>
            
            <h2 style="color: #1e293b; text-align: center;">Password Changed Successfully</h2>
            
            <p style="text-align: center;">Hello ${name}, your TaskMaster password has been changed.</p>

            <div class="info-box">
              <h4 style="margin: 0 0 15px 0;">Change Details:</h4>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Changed on:</strong> ${new Date().toLocaleString()}</p>
              ${ipAddress ? `<p><strong>IP Address:</strong> ${ipAddress}</p>` : ''}
              ${location ? `<p><strong>Location:</strong> ${location}</p>` : ''}
            </div>

            <div class="warning-box">
              <strong>⚠️ Didn't make this change?</strong>
              <p style="margin: 10px 0 0 0;">
                If you didn't change your password, please 
                <a href="mailto:${this.config.company.supportEmail}" style="color: #2563eb;">contact support</a> immediately
                and secure your account.
              </p>
            </div>
          </div>

          <div class="footer">
            <p>© ${year} ${this.config.company.name}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Your TaskMaster password has been changed successfully.

Change Details:
- Email: ${email}
- Changed on: ${new Date().toLocaleString()}
${ipAddress ? `- IP Address: ${ipAddress}` : ''}
${location ? `- Location: ${location}` : ''}

If you didn't make this change, please contact support immediately: ${this.config.company.supportEmail}

Best regards,
TaskMaster Security Team
    `;

    return { subject, html, text };
  }

  // Login Notification Template (for new device/login)
  getLoginNotificationTemplate(params: {
    name: string;
    email: string;
    ipAddress: string;
    location: string;
    userAgent: string;
    time: Date;
  }): { subject: string; html: string; text: string } {
    const { name, email, ipAddress, location, userAgent, time } = params;
    const year = new Date().getFullYear();

    const subject = `🔔 New Login to Your TaskMaster Account`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Login - TaskMaster</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f7fc;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            padding: 40px 30px;
            text-align: center;
          }
          .logo {
            font-size: 32px;
            font-weight: 800;
            color: white;
          }
          .content {
            padding: 40px 30px;
          }
          .info-box {
            background: #f1f5f9;
            padding: 25px;
            border-radius: 12px;
            margin: 25px 0;
          }
          .info-row {
            padding: 10px 0;
            border-bottom: 1px solid #e2e8f0;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .warning-box {
            background: #fef2f2;
            border: 1px solid #fecaca;
            padding: 20px;
            border-radius: 10px;
            margin: 25px 0;
          }
          .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            font-size: 14px;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🔔 TaskMaster</div>
          </div>
          
          <div class="content">
            <h2 style="color: #1e293b;">Hello ${name},</h2>
            
            <p>A new login was detected on your TaskMaster account.</p>

            <div class="info-box">
              <h4 style="margin: 0 0 15px 0;">📱 Login Details:</h4>
              
              <div class="info-row">
                <strong>Email:</strong> ${email}
              </div>
              
              <div class="info-row">
                <strong>Time:</strong> ${time.toLocaleString()}
              </div>
              
              <div class="info-row">
                <strong>IP Address:</strong> ${ipAddress}
              </div>
              
              <div class="info-row">
                <strong>Location:</strong> ${location}
              </div>
              
              <div class="info-row">
                <strong>Device:</strong> ${userAgent}
              </div>
            </div>

            <div class="warning-box">
              <strong>⚠️ Was this you?</strong>
              <p style="margin: 10px 0 0 0;">
                If this was you, no action is needed. If you don't recognize this activity, 
                please <a href="mailto:${this.config.company.supportEmail}" style="color: #2563eb;">contact support</a> 
                immediately and secure your account.
              </p>
            </div>
          </div>

          <div class="footer">
            <p>© ${year} ${this.config.company.name}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Hello ${name},

A new login was detected on your TaskMaster account.

Login Details:
- Email: ${email}
- Time: ${time.toLocaleString()}
- IP Address: ${ipAddress}
- Location: ${location}
- Device: ${userAgent}

If this was you, no action is needed. If you don't recognize this activity, please contact support immediately.

Best regards,
TaskMaster Security Team
    `;

    return { subject, html, text };
  }
}

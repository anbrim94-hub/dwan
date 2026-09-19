import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '../config/emailjs';

class NotificationService {
  private static instance: NotificationService;
  private sentNotifications: Set<string>;
  private initialized: boolean = false;

  private constructor() {
    this.sentNotifications = new Set();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public init() {
    if (!this.initialized) {
      emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
      this.initialized = true;
    }
  }

  private generateNotificationId(action: string, email?: string): string {
    const timestamp = Math.floor(Date.now() / 60000); // Round to minutes
    return `${action}-${email || ''}-${timestamp}`;
  }

  public async sendNotification(params: {
    action: string;
    email?: string;
    templateId?: string;
    data: Record<string, any>;
  }): Promise<void> {
    const { action, email, templateId = EMAILJS_CONFIG.TEMPLATE_ID, data } = params;

    try {
      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        templateId,
        {
          ...data,
          action,
          timestamp: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error(`Failed to send notification ${action}:`, error);
      throw error;
    }
  }
}

export const notificationService = NotificationService.getInstance();
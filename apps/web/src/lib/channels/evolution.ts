import axios from 'axios';
import { ChannelAdapter, ChannelId, SessionState } from './types';

interface EvolutionConfig {
  baseUrl: string;
  apiKey: string;
  instanceName: string;
}

export class EvolutionAdapter implements ChannelAdapter {
  public id: ChannelId = 'evolution';
  private client: ReturnType<typeof axios.create>;
  private config: EvolutionConfig;

  constructor(config: EvolutionConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'apikey': config.apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  async parseWebhook(req: Request): Promise<any> {
    const data = await req.json();

    // Evolution API event shape: { event: 'MESSAGES_UPSERT', data: { key: { remoteJid: '...' }, message: { conversation: '...' } } }
    if (data.event !== 'MESSAGES_UPSERT') return null;

    const msgData = data.data;
    if (!msgData || !msgData.key || !msgData.key.remoteJid) return null;

    return {
      channel: this.id,
      contactId: msgData.key.remoteJid,
      contactName: msgData.pushName,
      text: msgData.message?.conversation || msgData.message?.extendedTextMessage?.text || '',
      receivedAt: new Date().toISOString(),
      raw: data,
    };
  }

  async ensureSession(cfg: { instanceName: string }): Promise<SessionState> {
    const name = cfg.instanceName || this.config.instanceName;

    try {
      // 1. Check if instance exists
      const { data: instances } = await this.client.get('/instance/fetchInstances');
      const exists = instances.find((i: any) => i.instance.name === name);

      if (!exists) {
        // 2. Create if not exists
        await this.client.post('/instance/create', {
          instanceName: name,
          qrcode: true,
        });
      }

      // 3. Get current state
      const { data: statusData } = await this.client.get(`/instance/connectionState/${name}`);
      const state = statusData.instance?.state;

      if (state === 'open') return { status: 'WORKING' };
      if (state === 'connecting') return { status: 'STARTING' };
      if (state === 'close') return { status: 'STOPPED' };

      // Check for QR
      const { data: qrData } = await this.client.get(`/instance/qrcode/${name}`);
      if (qrData?.base64) return { status: 'SCAN_QR', qrCode: qrData.base64 };

      return { status: 'FAILED' };
    } catch (error: any) {
      console.error('Evolution ensureSession error:', error.response?.data || error.message);
      return { status: 'FAILED', error: error.message };
    }
  }

  async getSessionStatus(): Promise<SessionState> {
    // In a real implementation, this would poll the current state
    // For MVP, we rely on ensureSession or a dedicated status call
    return { status: 'WORKING' };
  }

  async sendText(contactId: string, text: string): Promise<void> {
    await this.client.post(`/message/sendText/${this.config.instanceName}`, {
      number: contactId,
      text: text,
    });
  }

  async logout(): Promise<void> {
    await this.client.delete(`/instance/logout/${this.config.instanceName}`);
  }
}

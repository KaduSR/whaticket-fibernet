import axios, { AxiosInstance } from 'axios';
import { prisma } from '@/lib/db';

interface IXCConfig {
  url: string;
  token: string;
}

export class IXCClient {
  private client: AxiosInstance;
  private config: IXCConfig;

  constructor(config: IXCConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.url,
      headers: {
        'Content-Type': 'application/json',
        'ixcsoft:token': config.token, // Adjust if the header name is different
      },
    });
  }

  /**
   * Standard GET pattern for IXC: sends JSON body with query parameters
   */
  async get<T>(endpoint: string, payload: any): Promise<T> {
    const response = await this.client.get<T>(endpoint, {
      data: payload,
      // Note: Axios GET with data requires specific handling or using request method
    });
    return response.data;
  }

  // More reliable way to handle GET with body for some environments
  async getWithBody<T>(endpoint: string, payload: any): Promise<T> {
    const response = await this.client.request<T>({
      method: 'GET',
      url: endpoint,
      data: payload,
    });
    return response.data;
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await this.client.post<T>(endpoint, data);
    return response.data;
  }
}

/**
 * Factory to get IXC client from database
 */
export async function getIXCClient(): Promise<IXCClient | null> {
  const configData = await prisma.integrationConfig.findUnique({
    where: { key: 'ixc_erp' },
  });

  if (!configData || !configData.value) return null;

  const config = configData.value as unknown as IXCConfig;
  return new IXCClient(config);
}

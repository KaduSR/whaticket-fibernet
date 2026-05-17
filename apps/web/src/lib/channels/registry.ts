import { EvolutionAdapter } from './evolution';
import { ChannelAdapter, ChannelId } from './types';

// In a real implementation, these would be loaded from setup.config.json
// For now, we'll mock the config for testing the registry logic.
const MOCK_CONFIG = {
  enabled: ['evolution'],
  evolution_api: {
    enabled: true,
    baseUrl: process.env.NEXT_PUBLIC_EVOLUTION_BASE_URL || 'http://localhost:8080',
    apiKey: process.env.NEXT_PUBLIC_EVOLUTION_API_KEY || '',
    instanceName: 'default',
  }
};

export function getEnabledAdapters(): Record<ChannelId, ChannelAdapter> {
  const adapters: Record<ChannelId, ChannelAdapter> = {} as any;

  if (MOCK_CONFIG.evolution_api.enabled) {
    adapters['evolution'] = new EvolutionAdapter({
      baseUrl: MOCK_CONFIG.evolution_api.baseUrl,
      apiKey: MOCK_CONFIG.evolution_api.apiKey,
      instanceName: MOCK_CONFIG.evolution_api.instanceName,
    });
  }

  return adapters;
}

import {
  readAgentConfig,
  readApprovalConfig,
  readDashboardConfig,
  readIntegrationConfig,
  readServerConfig,
} from '../env.js';
import { readStorageConfig } from '../db/config.js';
import { readRetentionSchedulerConfig } from './retention.js';

/** Validate executable entry points before storage, provider or worker startup. */
export function validateStartupConfiguration(environment: NodeJS.ProcessEnv = process.env): void {
  readServerConfig(environment);
  readIntegrationConfig(environment);
  const agent = readAgentConfig(environment);
  readApprovalConfig(environment);
  readDashboardConfig(environment);
  readRetentionSchedulerConfig(environment);
  readStorageConfig(environment);
  if (agent.model.startsWith('openai/')) {
    const key = environment.OPENAI_API_KEY;
    if (!key || !key.trim()) {
      throw new Error(
        'OPENAI_API_KEY is required for the configured OpenAI model. Set it in .env or your secret manager.',
      );
    }
    if (key.trim() !== key) throw new Error('OPENAI_API_KEY must not contain surrounding whitespace.');
  } else if (agent.model.startsWith('nvidia/')) {
    const key = environment.NVIDIA_API_KEY;
    if (environment.RUNTIME_MODE !== 'local' && (!key || !key.trim())) {
      throw new Error(
        'NVIDIA_API_KEY is required for the configured NVIDIA model outside local mode. Set it in .env or your secret manager.',
      );
    }
    if (key && key.trim() !== key) throw new Error('NVIDIA_API_KEY must not contain surrounding whitespace.');
  }
}

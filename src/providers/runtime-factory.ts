import type { IntegrationConfig } from '../env.js';
import type { OperationalStore } from '../db/operational-store.js';
import { DomainError } from '../domain/errors.js';
import type { IncidentProvider } from './incident-provider.js';
import { createLinearIncidentProvider } from './linear-incident-provider.js';
import { LocalIncidentProvider } from './local-incident-provider.js';
import {
  type IdentityMutationAuthorizer,
  type WorkOsIdentityProvider,
} from './identity-provider.js';
import { IpinfoLiteProvider, type GeoIpTransport } from './geoip-provider.js';

/**
 * Selects adapters once from validated configuration. Non-local runtimes never
 * replace an enabled remote integration with a local implementation.
 */
export function createIncidentProvider(
  config: IntegrationConfig,
  dependencies: Readonly<{ store?: OperationalStore }> = {},
): IncidentProvider {
  if (config.mode === 'local') return new LocalIncidentProvider(dependencies);
  if (!config.linear.enabled) {
    return new DisabledIncidentProvider();
  }
  if (!config.linear.apiKey || !config.linear.workspaceId || !config.linear.teamId || !config.linear.internalBaseUrl)
    throw new DomainError('VALIDATION_FAILED');
  return createLinearIncidentProvider({
    apiKey: config.linear.apiKey,
    workspaceId: config.linear.workspaceId,
    teamId: config.linear.teamId,
    ...(config.linear.projectId ? { projectId: config.linear.projectId } : {}),
    severityLabelIds: config.linear.severityLabelIds ?? {},
    statusStateIds: config.linear.statusStateIds ?? {},
    severityLabelNames: config.linear.severityLabelNames,
    statusStateNames: config.linear.statusStateNames,
    internalBaseUrl: config.linear.internalBaseUrl,
  });
}

class DisabledIncidentProvider implements IncidentProvider {
  readonly providerId = 'disabled' as const;
  async create(): Promise<never> {
    throw new DomainError('VALIDATION_FAILED');
  }
  async update(): Promise<never> {
    throw new DomainError('VALIDATION_FAILED');
  }
}

export function createIdentityProvider(
  config: IntegrationConfig,
  _authorizeMutation: IdentityMutationAuthorizer,
  _dependencies: Readonly<{ openStore?: () => OperationalStore }> = {},
): WorkOsIdentityProvider | undefined {
  if (!config.workos.enabled) return undefined;
  throw new DomainError('VALIDATION_FAILED');
}

export function createGeoIpProvider(
  config: IntegrationConfig,
  dependencies: Readonly<{
    store?: OperationalStore;
    openStore?: () => OperationalStore;
    transport?: GeoIpTransport;
  }> = {},
): IpinfoLiteProvider | undefined {
  if (!config.ipinfo.enabled) return undefined;
  if (!config.ipinfo.token || !config.ipinfo.cacheHmacKey) throw new DomainError('VALIDATION_FAILED');
  return new IpinfoLiteProvider({
    token: config.ipinfo.token,
    timeoutMs: config.ipinfo.timeoutMs,
    cacheTtlMs: config.ipinfo.cacheTtlSeconds * 1_000,
    retentionDays: config.ipinfo.evidenceRetentionDays,
    cacheHmacKey: config.ipinfo.cacheHmacKey,
    cacheHmacKeyVersion: config.ipinfo.cacheHmacKeyVersion!,
    ...(config.ipinfo.previousCacheHmacKey
      ? {
          previousCacheHmacKey: config.ipinfo.previousCacheHmacKey,
          previousCacheHmacKeyVersion: config.ipinfo.previousCacheHmacKeyVersion!,
        }
      : {}),
    ...(dependencies.store ? { store: dependencies.store } : {}),
    ...(dependencies.openStore ? { openStore: dependencies.openStore } : {}),
    ...(dependencies.transport ? { transport: dependencies.transport } : {}),
  });
}

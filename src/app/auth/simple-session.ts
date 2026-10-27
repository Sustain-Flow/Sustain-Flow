import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

import type { DashboardConfig } from '../../env.js';
import {
  type DashboardRole,
  type VerifiedDashboardSession,
} from './dashboard-principal.js';

export type LoginIntent = 'sign-in' | 'sign-up';

export type DashboardOrganization = Readonly<{
  organizationId: string;
  organizationName: string;
  role: DashboardRole;
}>;

export interface DashboardSessionClient {
  loginWithPassword?(
    input: Readonly<{ username: string; password: string }>,
  ): Promise<
    | Readonly<{ kind: 'ok'; sealedSession: string; session: VerifiedDashboardSession }>
    | Readonly<{ kind: 'invalid_credentials'; message: string }>
  >;
  authenticate(sealedSession: string): Promise<VerifiedDashboardSession | null>;
  refresh(
    sealedSession: string,
    organizationId?: string,
  ): Promise<
    | Readonly<{
        kind: 'ok';
        sealedSession: string;
        session: VerifiedDashboardSession;
      }>
    | Readonly<{ kind: 'terminal' }>
  >;
  getLogoutUrl(sessionId: string, returnTo: string): Promise<string | null>;
  listOrganizations(userId: string): Promise<readonly DashboardOrganization[]>;
  startLogin(
    input: Readonly<{ intent: LoginIntent }>,
  ): Promise<Readonly<{ authorizationUrl: string; state: string; codeVerifier: string }>>;
  completeLogin(
    input: Readonly<{ code: string; codeVerifier: string }>,
  ): Promise<Readonly<{ sealedSession: string; session: VerifiedDashboardSession }>>;
}

export type SimpleSessionPayload = Readonly<{
  userId: string;
  sessionId: string;
  organizationId: string;
  roles: readonly string[];
  username: string;
  createdAt: number;
}>;

export function sealSimpleSession(secret: string, payload: SimpleSessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = createHmac('sha256', secret).update(data).digest('base64url');
  return `${data}.${signature}`;
}

export function openSimpleSession(
  secret: string,
  sealedSession: string,
  maxAgeSeconds: number,
  nowMs = Date.now(),
): SimpleSessionPayload | null {
  if (!sealedSession || typeof sealedSession !== 'string') return null;
  const dotIndex = sealedSession.indexOf('.');
  if (dotIndex === -1) return null;
  const data = sealedSession.slice(0, dotIndex);
  const signature = sealedSession.slice(dotIndex + 1);
  if (!data || !signature) return null;

  const expectedSignature = createHmac('sha256', secret).update(data).digest('base64url');
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const raw = Buffer.from(data, 'base64url').toString('utf8');
    const parsed = JSON.parse(raw) as Partial<SimpleSessionPayload>;
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      typeof parsed.userId !== 'string' ||
      typeof parsed.sessionId !== 'string' ||
      typeof parsed.organizationId !== 'string' ||
      !Array.isArray(parsed.roles) ||
      typeof parsed.createdAt !== 'number'
    ) {
      return null;
    }
    if (nowMs - parsed.createdAt > maxAgeSeconds * 1000) {
      return null;
    }
    return parsed as SimpleSessionPayload;
  } catch {
    return null;
  }
}

export type SimpleAuthUser = Readonly<{
  userId: string;
  username: string;
  email: string;
  password: string;
  role: DashboardRole;
  organizationId: string;
  organizationName: string;
}>;

export function getBuiltInUsers(environment: NodeJS.ProcessEnv = process.env): readonly SimpleAuthUser[] {
  const adminPassword =
    environment.SIMPLE_AUTH_ADMIN_PASSWORD ||
    environment.SIMPLE_AUTH_PASSWORD ||
    environment.ZETARIS_ADMIN_PASSWORD ||
    'Zetaris1@';
  const analystPassword =
    environment.SIMPLE_AUTH_ANALYST_PASSWORD ||
    environment.SIMPLE_AUTH_PASSWORD ||
    'Analyst1@';
  const viewerPassword =
    environment.SIMPLE_AUTH_VIEWER_PASSWORD ||
    environment.SIMPLE_AUTH_PASSWORD ||
    'Viewer1@';

  const defaultOrgId = environment.ZETARIS_ADMIN_ORG || 'zetaris';
  const defaultOrgName = 'Zetaris';

  const users: SimpleAuthUser[] = [
    {
      userId: 'user-admin',
      username: 'admin',
      email: environment.ZETARIS_ADMIN_EMAIL || 'admin@zetaris.com',
      password: adminPassword,
      role: 'soc_manager',
      organizationId: defaultOrgId,
      organizationName: defaultOrgName,
    },
    {
      userId: 'user-analyst',
      username: 'analyst',
      email: 'analyst@zetaris.com',
      password: analystPassword,
      role: 'soc_analyst',
      organizationId: defaultOrgId,
      organizationName: defaultOrgName,
    },
    {
      userId: 'user-viewer',
      username: 'viewer',
      email: 'viewer@zetaris.com',
      password: viewerPassword,
      role: 'viewer',
      organizationId: defaultOrgId,
      organizationName: defaultOrgName,
    },
  ];

  if (environment.AUTH_USERNAME && environment.AUTH_PASSWORD) {
    const role: DashboardRole = (environment.AUTH_ROLE as DashboardRole) || 'soc_manager';
    users.unshift({
      userId: 'user-custom',
      username: environment.AUTH_USERNAME.toLowerCase(),
      email: environment.AUTH_EMAIL || environment.AUTH_USERNAME.toLowerCase(),
      password: environment.AUTH_PASSWORD,
      role,
      organizationId: environment.AUTH_ORG || defaultOrgId,
      organizationName: environment.AUTH_ORG_NAME || defaultOrgName,
    });
  }

  return Object.freeze(users);
}

export function safeWorkosRedirect(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      ['api.workos.com', 'authkit.workos.com'].includes(url.hostname) &&
      /^\/(?:user_management\/|sso\/|logout)/u.test(url.pathname)
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export function validateWorkosDashboardConfiguration(config: DashboardConfig): void {
  if (config.enabled && config.workosApiKey && !config.csrfSecret) {
    throw new Error('WorkOS dashboard authentication is incomplete. Missing: DASHBOARD_CSRF_SECRET.');
  }
}

export function createDashboardSessionClient(
  config: DashboardConfig,
  environment: NodeJS.ProcessEnv = process.env,
  nowMs = Date.now,
): DashboardSessionClient | null {
  if (!config.enabled) return null;

  const secret = config.csrfSecret || 'simple-auth-internal-session-secret-key-32chars';
  const users = getBuiltInUsers(environment);

  return {
    loginWithPassword: async ({ username, password }) => {
      const normalizedInput = username.trim().toLowerCase();
      const user = users.find(
        candidate =>
          candidate.username.toLowerCase() === normalizedInput ||
          candidate.email.toLowerCase() === normalizedInput,
      );

      if (!user) {
        return { kind: 'invalid_credentials', message: 'Invalid username or password.' };
      }

      const inputBuf = Buffer.from(password);
      const userBuf = Buffer.from(user.password);
      if (inputBuf.length !== userBuf.length || !timingSafeEqual(inputBuf, userBuf)) {
        return { kind: 'invalid_credentials', message: 'Invalid username or password.' };
      }

      const sessionId = randomUUID();
      const payload: SimpleSessionPayload = {
        userId: user.userId,
        sessionId,
        organizationId: user.organizationId,
        roles: [user.role],
        username: user.username,
        createdAt: nowMs(),
      };

      const sealedSession = sealSimpleSession(secret, payload);
      const session: VerifiedDashboardSession = {
        userId: user.userId,
        sessionId,
        organizationId: user.organizationId,
        roles: [user.role],
      };

      return {
        kind: 'ok',
        sealedSession,
        session,
      };
    },

    authenticate: async (sealedSession: string) => {
      const opened = openSimpleSession(secret, sealedSession, config.sessionMaxAgeSeconds, nowMs());
      if (!opened) return null;
      return {
        userId: opened.userId,
        sessionId: opened.sessionId,
        organizationId: opened.organizationId,
        roles: opened.roles,
      };
    },

    refresh: async (sealedSession: string, organizationId?: string) => {
      const opened = openSimpleSession(secret, sealedSession, config.sessionMaxAgeSeconds, nowMs());
      if (!opened) return { kind: 'terminal' };

      const targetOrg = organizationId ?? opened.organizationId;
      const user = users.find(candidate => candidate.userId === opened.userId);
      const role = user ? user.role : (opened.roles[0] as DashboardRole);

      const refreshedPayload: SimpleSessionPayload = {
        ...opened,
        organizationId: targetOrg,
        roles: [role],
        createdAt: nowMs(),
      };

      const refreshedSealedSession = sealSimpleSession(secret, refreshedPayload);
      return {
        kind: 'ok',
        sealedSession: refreshedSealedSession,
        session: {
          userId: refreshedPayload.userId,
          sessionId: refreshedPayload.sessionId,
          organizationId: refreshedPayload.organizationId,
          roles: refreshedPayload.roles,
        },
      };
    },

    getLogoutUrl: async () => null,

    listOrganizations: async (userId: string) => {
      const user = users.find(candidate => candidate.userId === userId);
      if (!user) return [];
      return [
        {
          organizationId: user.organizationId,
          organizationName: user.organizationName,
          role: user.role,
        },
      ];
    },

    startLogin: async () => ({
      authorizationUrl: '/auth/login',
      state: 'state_simple_auth',
      codeVerifier: 'v'.repeat(43),
    }),

    completeLogin: async () => {
      const admin = users[0]!;
      const sessionId = randomUUID();
      const payload: SimpleSessionPayload = {
        userId: admin.userId,
        sessionId,
        organizationId: admin.organizationId,
        roles: [admin.role],
        username: admin.username,
        createdAt: nowMs(),
      };
      const sealedSession = sealSimpleSession(secret, payload);
      return {
        sealedSession,
        session: {
          userId: admin.userId,
          sessionId,
          organizationId: admin.organizationId,
          roles: [admin.role],
        },
      };
    },
  };
}

/** Legacy alias for backwards compatibility */
export const createWorkosDashboardSessionClient = createDashboardSessionClient;

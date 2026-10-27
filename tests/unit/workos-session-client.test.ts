import { describe, expect, it } from 'vite-plus/test';

import {
  createDashboardSessionClient,
  getBuiltInUsers,
  openSimpleSession,
  sealSimpleSession,
} from '../../src/app/auth/simple-session.js';

describe('Simple Auth dashboard session client', () => {
  const baseConfig = {
    enabled: true,
    dashboardOrigin: 'http://localhost:3000',
    csrfSecret: 's'.repeat(32),
    sessionMaxAgeSeconds: 28_800,
    sseMaxConnections: 4,
  };

  it('provides built-in admin, analyst, and viewer users', () => {
    const users = getBuiltInUsers();
    expect(users).toHaveLength(3);
    const admin = users.find(u => u.username === 'admin');
    const analyst = users.find(u => u.username === 'analyst');
    const viewer = users.find(u => u.username === 'viewer');

    expect(admin).toMatchObject({
      role: 'soc_manager',
      email: 'admin@zetaris.com',
    });
    expect(analyst).toMatchObject({
      role: 'soc_analyst',
      email: 'analyst@zetaris.com',
    });
    expect(viewer).toMatchObject({
      role: 'viewer',
      email: 'viewer@zetaris.com',
    });
  });

  it('supports custom users from environment variables', () => {
    const customUsers = getBuiltInUsers({
      AUTH_USERNAME: 'security-lead',
      AUTH_PASSWORD: 'LeadPassword123!',
      AUTH_ROLE: 'soc_manager',
    });
    expect(customUsers[0]).toMatchObject({
      username: 'security-lead',
      role: 'soc_manager',
    });
  });

  it('successfully authenticates with valid credentials', async () => {
    const client = createDashboardSessionClient(baseConfig);
    expect(client).not.toBeNull();

    const result = await client!.loginWithPassword!({
      username: 'admin@zetaris.com',
      password: 'Zetaris1@',
    });

    expect(result.kind).toBe('ok');
    if (result.kind === 'ok') {
      expect(result.session.roles).toEqual(['soc_manager']);
      expect(result.sealedSession).toContain('.');

      const authenticated = await client!.authenticate(result.sealedSession);
      expect(authenticated).toMatchObject({
        userId: 'user-admin',
        roles: ['soc_manager'],
      });
    }
  });

  it('also matches by username instead of email', async () => {
    const client = createDashboardSessionClient(baseConfig);
    const result = await client!.loginWithPassword!({
      username: 'analyst',
      password: 'Analyst1@',
    });

    expect(result.kind).toBe('ok');
    if (result.kind === 'ok') {
      expect(result.session.roles).toEqual(['soc_analyst']);
    }
  });

  it('rejects invalid password', async () => {
    const client = createDashboardSessionClient(baseConfig);
    const result = await client!.loginWithPassword!({
      username: 'admin@zetaris.com',
      password: 'WrongPassword!',
    });

    expect(result.kind).toBe('invalid_credentials');
  });

  it('rejects unknown user', async () => {
    const client = createDashboardSessionClient(baseConfig);
    const result = await client!.loginWithPassword!({
      username: 'nonexistent@zetaris.com',
      password: 'Zetaris1@',
    });

    expect(result.kind).toBe('invalid_credentials');
  });

  it('seals and verifies tamper-proof session tokens', () => {
    const secret = 'test-secret-at-least-32-chars-long!';
    const payload = {
      userId: 'user_123',
      sessionId: 'session_123',
      organizationId: 'org_123',
      roles: ['soc_manager'],
      username: 'admin',
      createdAt: Date.now(),
    };

    const sealed = sealSimpleSession(secret, payload);
    const opened = openSimpleSession(secret, sealed, 3600);
    expect(opened).toMatchObject({
      userId: 'user_123',
      sessionId: 'session_123',
      roles: ['soc_manager'],
    });

    // Tampered token fails verification
    const tampered = sealed.slice(0, -3) + 'abc';
    expect(openSimpleSession(secret, tampered, 3600)).toBeNull();
  });

  it('rejects expired session tokens', () => {
    const secret = 'test-secret-at-least-32-chars-long!';
    const now = 1_000_000;
    const expiredPayload = {
      userId: 'user_123',
      sessionId: 'session_123',
      organizationId: 'org_123',
      roles: ['soc_manager'],
      username: 'admin',
      createdAt: now - 3600 * 1000 - 10,
    };

    const sealed = sealSimpleSession(secret, expiredPayload);
    expect(openSimpleSession(secret, sealed, 3600, now)).toBeNull();
  });

  it('lists organizations for known user', async () => {
    const client = createDashboardSessionClient(baseConfig);
    const orgs = await client!.listOrganizations('user-admin');
    expect(orgs).toEqual([
      {
        organizationId: 'zetaris',
        organizationName: 'Zetaris',
        role: 'soc_manager',
      },
    ]);
  });
});

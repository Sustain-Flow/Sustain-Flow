import { Hono } from 'hono';
import { describe, expect, it } from 'vite-plus/test';

import { createDashboardSessionClient } from '../../src/app/auth/simple-session.js';
import type { OperationalStore } from '../../src/db/operational-store.js';
import { defensiveHeadersMiddleware, requestContextMiddleware, type AppEnv } from '../../src/http-context.js';
import { consoleLogger } from '../../src/logging.js';
import { registerDashboardRoutes } from '../../src/app/dashboard/routes.js';

const secret = 's'.repeat(32);
const config = {
  enabled: true,
  dashboardOrigin: 'http://localhost:3000',
  csrfSecret: secret,
  sessionMaxAgeSeconds: 28_800,
  sseMaxConnections: 1,
};

const store: OperationalStore = {
  execute: async () => ({ rows: [] }) as never,
  transaction: async operation =>
    operation({
      execute: store.execute,
      batch: async () => [] as never,
    }),
  close: () => undefined,
};

function buildApp() {
  const application = new Hono<AppEnv>();
  application.use('*', requestContextMiddleware(() => 'request-simple-auth'));
  application.use('*', defensiveHeadersMiddleware);

  const sessionClient = createDashboardSessionClient(config);

  registerDashboardRoutes(application, {
    store,
    logger: consoleLogger,
    config,
    approvalConfig: {
      mode: 'local',
      localApprovalsEnabled: true,
      actionTimeoutMs: 1_000,
      rateLimit: 8,
    },
    sessionClient,
    reconcileApprovalRun: async () => 'completed',
  });

  return application;
}

describe('Simple Auth integration tests', () => {
  it('renders login form on unauthenticated /dashboard request', async () => {
    const app = buildApp();
    const response = await app.request('http://localhost:3000/dashboard');

    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain('Operator sign in');
    expect(html).toContain('name="username"');
    expect(html).toContain('name="password"');
    expect(html).toContain('Built-in Operator Accounts');
  });

  it('renders login page on /auth/login with clean inputs', async () => {
    const app = buildApp();
    const response = await app.request('http://localhost:3000/auth/login');

    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain('action="/auth/login"');
    expect(html).toContain('admin@zetaris.com');
  });

  it('rejects invalid credentials and redirects to /auth/login with error', async () => {
    const app = buildApp();
    const formData = new FormData();
    formData.append('username', 'admin@zetaris.com');
    formData.append('password', 'WrongPassword123');

    const response = await app.request('http://localhost:3000/auth/login', {
      method: 'POST',
      body: formData,
    });

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toContain('/auth/login?error=invalid_credentials');
  });

  it('authenticates admin@zetaris.com, sets cookies, and accesses dashboard', async () => {
    const app = buildApp();
    const formData = new FormData();
    formData.append('username', 'admin@zetaris.com');
    formData.append('password', 'Zetaris1@');

    const loginResponse = await app.request('http://localhost:3000/auth/login', {
      method: 'POST',
      body: formData,
    });

    expect(loginResponse.status).toBe(302);
    expect(loginResponse.headers.get('Location')).toBe('/dashboard');

    const setCookies = loginResponse.headers.getSetCookie();
    expect(setCookies.length).toBeGreaterThan(0);
    const sessionCookie = setCookies.find(c => c.includes('authkit-local-session='))!;
    expect(sessionCookie).toBeDefined();

    // Now request /dashboard with the session cookie
    const cookieHeader = setCookies.map(c => c.split(';')[0]).join('; ');
    const dashboardResponse = await app.request('http://localhost:3000/dashboard', {
      headers: { Cookie: cookieHeader },
    });

    expect(dashboardResponse.status).toBe(200);
    const dashboardHtml = await dashboardResponse.text();
    expect(dashboardHtml).toContain('Soc Manager');
    expect(dashboardHtml).toContain('Log out');
  });

  it('authenticates analyst and viewer roles with expected role display', async () => {
    const app = buildApp();

    for (const [username, password, expectedRoleText] of [
      ['analyst@zetaris.com', 'Analyst1@', 'Soc Analyst'],
      ['viewer@zetaris.com', 'Viewer1@', 'Viewer'],
    ] as const) {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const loginResponse = await app.request('http://localhost:3000/auth/login', {
        method: 'POST',
        body: formData,
      });

      expect(loginResponse.status).toBe(302);
      const setCookies = loginResponse.headers.getSetCookie();
      const cookieHeader = setCookies.map(c => c.split(';')[0]).join('; ');

      const dashboardResponse = await app.request('http://localhost:3000/dashboard', {
        headers: { Cookie: cookieHeader },
      });

      expect(dashboardResponse.status).toBe(200);
      const html = await dashboardResponse.text();
      expect(html).toContain(expectedRoleText);
    }
  });

  it('logs out and clears session cookies', async () => {
    const app = buildApp();
    const formData = new FormData();
    formData.append('username', 'admin@zetaris.com');
    formData.append('password', 'Zetaris1@');

    const loginResponse = await app.request('http://localhost:3000/auth/login', {
      method: 'POST',
      body: formData,
    });
    const setCookies = loginResponse.headers.getSetCookie();
    const cookieHeader = setCookies.map(c => c.split(';')[0]).join('; ');

    // Load dashboard to get CSRF token
    const dashboardResponse = await app.request('http://localhost:3000/dashboard', {
      headers: { Cookie: cookieHeader },
    });
    const html = await dashboardResponse.text();
    const csrfMatch = /name="csrfToken"\s+value="([^"]+)"/u.exec(html);
    expect(csrfMatch).not.toBeNull();
    const csrfToken = csrfMatch![1]!;

    // Logout
    const logoutForm = new FormData();
    logoutForm.append('csrfToken', csrfToken);
    const logoutResponse = await app.request('http://localhost:3000/auth/logout', {
      method: 'POST',
      headers: {
        Cookie: cookieHeader,
        Origin: 'http://localhost:3000',
        'Sec-Fetch-Site': 'same-origin',
      },
      body: logoutForm,
    });

    expect(logoutResponse.status).toBe(303);
    const logoutCookies = logoutResponse.headers.getSetCookie();
    expect(logoutCookies.some(c => c.includes('authkit-local-session=;') || c.includes('Max-Age=0'))).toBe(true);
  });
});

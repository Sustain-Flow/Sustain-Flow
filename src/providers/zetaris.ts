/**
 * Zetaris REST API Client
 * Connects to Zetaris HTTP proxy to execute federated SQL queries.
 */

export interface ZetarisConfig {
  baseUrl: string;
  adminEmail: string;
  adminPassword: string;
  defaultCatalog?: string;
}

export interface QueryResult<T = Record<string, unknown>> {
  records: T[];
  pageNumber: number;
  pageLimit: number;
  totalCount: number;
  totalPages: number;
  queryToken?: string;
}

export class ZetarisClient {
  private baseUrl: string;
  private adminEmail: string;
  private adminPassword: string;
  private token: string | null = null;
  private orgId: string | null = null;
  private tokenExpiry: number = 0;

  constructor(config?: Partial<ZetarisConfig>) {
    this.baseUrl = config?.baseUrl || process.env.ZETARIS_BASE_URL || 'http://127.0.0.1:3000';
    this.adminEmail = config?.adminEmail || process.env.ZETARIS_ADMIN_EMAIL || 'admin@zetaris.com';
    this.adminPassword = config?.adminPassword || process.env.ZETARIS_ADMIN_PASSWORD || 'Zetaris1@';
  }

  private async authenticate(): Promise<{ token: string; orgId: string }> {
    const now = Date.now();
    if (this.token && this.orgId && this.tokenExpiry > now) {
      return { token: this.token, orgId: this.orgId };
    }

    const res = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: this.adminEmail,
        password: this.adminPassword,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Zetaris login failed (${res.status}): ${errText}`);
    }

    const data = (await res.json()) as { idToken?: string; token?: string; orgId?: number | string };
    const token = data.idToken || data.token;
    const orgId = String(data.orgId ?? '1');

    if (!token) {
      throw new Error('No JWT token returned from Zetaris login');
    }

    this.token = token;
    this.orgId = orgId;
    this.tokenExpiry = now + 15 * 60 * 1000; // cache token for 15 minutes

    return { token, orgId };
  }

  /**
   * Executes a SELECT SQL query through Zetaris REST API.
   * Auto-qualifies table names with PRODUCTION_RAW if not qualified.
   */
  async runSql<T = Record<string, unknown>>(sql: string, pageLimit = 50): Promise<QueryResult<T>> {
    const { token, orgId } = await this.authenticate();

    let formattedSql = sql.trim().replace(/;$/, '');

    // Helper: auto-prefix production tables if written as plain names
    const tables = [
      'daily_metrics',
      'resource_assumptions',
      'downtime_event_log',
      'daily_operation_summary',
      'hourly_operation_breakdown',
      'processed_hourly',
    ];
    for (const tbl of tables) {
      const regex = new RegExp(`\\b(?<!PRODUCTION_RAW\\.)${tbl}\\b`, 'gi');
      formattedSql = formattedSql.replace(regex, `PRODUCTION_RAW.${tbl}`);
    }

    const res = await fetch(`${this.baseUrl}/api/proxy/query/sql/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-Org-ID': orgId,
        'X-Request-ID': '11111111-2222-3333-4444-555555555555',
      },
      body: JSON.stringify({
        select: formattedSql,
        pageLimit,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Zetaris query error (${res.status}): ${errText}`);
    }

    return (await res.json()) as QueryResult<T>;
  }
}

export const zetarisClient = new ZetarisClient();

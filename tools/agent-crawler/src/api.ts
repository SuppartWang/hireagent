import axios, { AxiosInstance } from 'axios';
import { config } from './config.js';
import type { EnrichedAgent, ImportResult } from './types.js';

export class HireAgentAPI {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: config.HIREAGENT_API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });
  }

  async login(): Promise<void> {
    if (!config.HIREAGENT_ADMIN_EMAIL || !config.HIREAGENT_ADMIN_PASSWORD) {
      throw new Error('HIREAGENT_ADMIN_EMAIL and HIREAGENT_ADMIN_PASSWORD are required in .env');
    }
    try {
      const res = await this.client.post('/auth/login', {
        email: config.HIREAGENT_ADMIN_EMAIL,
        password: config.HIREAGENT_ADMIN_PASSWORD,
      });
      this.token = res.data.token;
      this.client.defaults.headers.Authorization = `Bearer ${this.token}`;
      console.log(`✅ Logged in as ${res.data.user?.email || config.HIREAGENT_ADMIN_EMAIL}`);
    } catch (err: any) {
      throw new Error(`Login failed: ${err.response?.data?.error || err.message}`);
    }
  }

  async importAgents(agents: EnrichedAgent[]): Promise<ImportResult> {
    if (!this.token) await this.login();
    try {
      const res = await this.client.post('/admin/import-agents', {
        agents,
        publish: config.PUBLISH_ON_IMPORT,
      });
      return res.data as ImportResult;
    } catch (err: any) {
      throw new Error(`Import failed: ${err.response?.data?.error || err.message}`);
    }
  }
}

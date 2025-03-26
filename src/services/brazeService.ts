import { BrazeConfig, BrazeUser, BrazeResponse, BrazeError } from '../types/braze';

class BrazeService {
  private config: BrazeConfig;

  constructor(config: BrazeConfig) {
    this.config = config;
  }

  private async makeRequest(endpoint: string, method: string = 'GET', body?: any): Promise<BrazeResponse> {
    try {
      const url = `${this.config.instanceUrl}${endpoint}`;
      const headers = {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          message: data.message || 'An error occurred',
          errors: data.errors,
          status: response.status,
        } as BrazeError;
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  async getUser(externalId: string): Promise<BrazeResponse> {
    return this.makeRequest('/users/export/ids', 'POST', {
      external_ids: [externalId],
      fields_to_export: [
        'external_id',
        'email',
        'first_name',
        'last_name',
        'attributes',
        'created_at',
        'updated_at'
      ]
    });
  }

  async createUser(user: BrazeUser): Promise<BrazeResponse> {
    return this.makeRequest('/users/track', 'POST', {
      attributes: [user]
    });
  }

  async updateUser(externalId: string, attributes: Record<string, any>): Promise<BrazeResponse> {
    return this.makeRequest('/users/track', 'POST', {
      attributes: [{
        external_id: externalId,
        ...attributes
      }]
    });
  }

  async deleteUser(externalId: string): Promise<BrazeResponse> {
    return this.makeRequest('/users/delete', 'POST', {
      external_ids: [externalId]
    });
  }
}

export default BrazeService; 
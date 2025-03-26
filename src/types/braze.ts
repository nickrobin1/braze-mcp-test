export interface BrazeConfig {
  apiKey: string;
  instanceUrl: string;
  endpoint: string;
}

export interface BrazeUser {
  external_id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  attributes?: Record<string, any>;
}

export interface BrazeResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface BrazeError {
  message: string;
  errors?: string[];
  status?: number;
} 
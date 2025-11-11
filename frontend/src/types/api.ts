/**
 * API Types
 * Type definitions for API requests and responses
 */

// ===== Report Types =====

export interface ReportDTO {
  id: string;
  createdAt: string;
  updatedAt: string;
  dataJson: string;
  package?: string | null;
  sprint?: string | null;
  deploymentDate?: string | null;
  status?: string | null;
}

export interface CreateReportRequest {
  dataJson: string;
  package?: string;
  sprint?: string;
  deploymentDate?: string;
  status?: string;
}

export interface UpdateReportRequest {
  dataJson?: string;
  package?: string;
  sprint?: string;
  deploymentDate?: string;
  status?: string;
}

// ===== API Response Types =====

export interface ApiResponse<T> {
  data: T;
  success: true;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

// ===== HTTP Error Types =====

export class HttpError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message?: string,
    public details?: unknown
  ) {
    super(message || `HTTP Error ${status}: ${statusText}`);
    this.name = 'HttpError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network request failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string = 'Request timeout') {
    super(message);
    this.name = 'TimeoutError';
  }
}

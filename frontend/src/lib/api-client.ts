/**
 * API Client
 * HTTP client with error handling, timeouts, and retry logic
 */

import { config } from './config';
import { HttpError, NetworkError, TimeoutError } from '@/types/api';

export interface RequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;

  constructor(baseUrl: string, timeout: number) {
    this.baseUrl = baseUrl;
    this.defaultTimeout = timeout;
  }

  /**
   * Make an HTTP request with timeout and error handling
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestOptions = {}
  ): Promise<Response> {
    const { timeout = this.defaultTimeout, ...fetchOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new TimeoutError(`Request timeout after ${timeout}ms`);
        }
        throw new NetworkError(error.message);
      }

      throw error;
    }
  }

  /**
   * Make an HTTP request with retry logic
   */
  private async fetchWithRetry(
    url: string,
    options: RequestOptions = {}
  ): Promise<Response> {
    const { retries = 0, retryDelay = 1000, ...fetchOptions } = options;

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(url, fetchOptions);

        // Don't retry on successful responses or client errors (4xx)
        if (response.ok || (response.status >= 400 && response.status < 500)) {
          return response;
        }

        // Retry on server errors (5xx)
        if (attempt < retries) {
          await this.delay(retryDelay * (attempt + 1));
          continue;
        }

        return response;
      } catch (error) {
        lastError = error as Error;

        if (attempt < retries && this.isRetryableError(error)) {
          await this.delay(retryDelay * (attempt + 1));
          continue;
        }

        throw error;
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: unknown): boolean {
    return error instanceof NetworkError || error instanceof TimeoutError;
  }

  /**
   * Delay helper for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Handle HTTP response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorDetails;
      try {
        errorDetails = await response.json();
      } catch {
        errorDetails = await response.text();
      }

      throw new HttpError(
        response.status,
        response.statusText,
        typeof errorDetails === 'string'
          ? errorDetails
          : errorDetails?.message || 'Request failed',
        errorDetails
      );
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return undefined as T;
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json();
    }

    return response.text() as T;
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await this.fetchWithRetry(url, {
      ...options,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    return this.handleResponse<T>(response);
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await this.fetchWithRetry(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await this.fetchWithRetry(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await this.fetchWithRetry(url, {
      ...options,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    return this.handleResponse<T>(response);
  }
}

// Export singleton instance
export const apiClient = new ApiClient(config.api.baseUrl, config.api.timeout);

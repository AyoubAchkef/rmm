/**
 * Report Service
 * Business logic for report CRUD operations
 */

import { apiClient } from '@/lib/api-client';
import { config } from '@/lib/config';
import type {
  ReportDTO,
  CreateReportRequest,
  UpdateReportRequest,
} from '@/types/api';

class ReportService {
  private readonly endpoint = config.api.endpoints.reports;

  /**
   * Get all reports
   */
  async getAll(): Promise<ReportDTO[]> {
    return apiClient.get<ReportDTO[]>(this.endpoint);
  }

  /**
   * Get a single report by ID
   */
  async getById(id: string): Promise<ReportDTO> {
    return apiClient.get<ReportDTO>(`${this.endpoint}/${id}`);
  }

  /**
   * Create a new report
   */
  async create(request: CreateReportRequest): Promise<ReportDTO> {
    return apiClient.post<ReportDTO>(this.endpoint, request);
  }

  /**
   * Update an existing report
   */
  async update(id: string, request: UpdateReportRequest): Promise<ReportDTO> {
    return apiClient.put<ReportDTO>(`${this.endpoint}/${id}`, request);
  }

  /**
   * Delete a report
   */
  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Check API health
   */
  async healthCheck(): Promise<string> {
    return apiClient.get<string>(config.api.endpoints.health);
  }
}

// Export singleton instance
export const reportService = new ReportService();

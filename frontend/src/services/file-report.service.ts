import { apiClient } from '@/lib/api-client';

export interface ReportMetadata {
  id: string;
  package: string;
  sprint: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  status: 'draft' | 'final' | 'archived';
  version: number;
  tags: string[];
  deploymentDate?: string;
}

export interface ChangelogEntry {
  timestamp: string;
  action: string;
  user: string;
  version: number;
  changes?: Record<string, { old: any; new: any }>;
}

export interface ReportDetails {
  metadata: ReportMetadata;
  data: Record<string, any>;
  changelog: ChangelogEntry[];
  reportPath?: string;
}

export interface CreateReportRequest {
  package?: string;
  sprint?: string;
  deploymentDate?: string;
  createdBy?: string;
  tags?: string[];
  data?: Record<string, any>;
  templateHtml?: string;
}

export interface UpdateReportRequest {
  data?: Record<string, any>;
  templateHtml?: string;
  status?: string;
  tags?: string[];
  updatedBy?: string;
  action?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  count?: number;
}

class FileReportService {
  private baseUrl = '/api/filereports';

  /**
   * Créer un nouveau rapport
   */
  async create(request: CreateReportRequest): Promise<ReportMetadata> {
    const response = await apiClient.post<ApiResponse<ReportMetadata>>(
      this.baseUrl,
      request
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || response.error || 'Failed to create report');
    }

    return response.data;
  }

  /**
   * Mettre à jour un rapport existant
   */
  async update(id: string, request: UpdateReportRequest): Promise<ReportMetadata> {
    const response = await apiClient.put<ApiResponse<ReportMetadata>>(
      `${this.baseUrl}/${id}`,
      request
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || response.error || 'Failed to update report');
    }

    return response.data;
  }

  /**
   * Récupérer un rapport par ID
   */
  async get(id: string): Promise<ReportDetails | null> {
    try {
      const response = await apiClient.get<ApiResponse<ReportDetails>>(
        `${this.baseUrl}/${id}`
      );

      if (!response.success) {
        return null;
      }

      return response.data || null;
    } catch (error) {
      console.error('Error fetching report:', error);
      return null;
    }
  }

  /**
   * Lister tous les rapports
   */
  async list(): Promise<ReportMetadata[]> {
    const response = await apiClient.get<ApiResponse<ReportMetadata[]>>(
      this.baseUrl
    );

    if (!response.success) {
      throw new Error(response.message || response.error || 'Failed to list reports');
    }

    return response.data || [];
  }

  /**
   * Supprimer (archiver) un rapport
   */
  async delete(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `${this.baseUrl}/${id}`
    );

    if (!response.success) {
      throw new Error(response.message || response.error || 'Failed to delete report');
    }
  }
}

export const fileReportService = new FileReportService();

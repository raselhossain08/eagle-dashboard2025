/**
 * Eagle API Response Types
 * Professional type definitions for API responses
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
  requestId?: string;
}

export interface ApiError {
  success: false;
  message: string;
  error?: any;
  statusCode?: number;
  timestamp?: string;
  requestId?: string;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters?: Record<string, any>;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

export interface ListResponse<T = any> {
  items: T[];
  total: number;
  count: number;
}

export interface BulkOperationResponse<T = any> {
  success: T[];
  errors: Array<{
    item: any;
    error: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

export type SortOrder = 'asc' | 'desc';

export interface BaseFilters {
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}

export interface ApiRequestOptions {
  timeout?: number;
  retries?: number;
  cache?: boolean;
  headers?: Record<string, string>;
}
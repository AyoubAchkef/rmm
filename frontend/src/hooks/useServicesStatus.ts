/**
 * Unified hook to check all MCP services status
 * Optimized: Single interval for all services instead of 3 separate ones
 */

import { useState, useEffect, useCallback } from 'react';

interface ServiceStatus {
  isConnected: boolean;
  latency: number | null;
  isLoading: boolean;
  error: string | null;
}

interface ServicesStatus {
  azureDevOps: ServiceStatus;
  sharePoint: ServiceStatus;
  playwright: ServiceStatus;
}

const initialStatus: ServiceStatus = {
  isConnected: false,
  latency: null,
  isLoading: true,
  error: null,
};

export function useServicesStatus() {
  const [status, setStatus] = useState<ServicesStatus>({
    azureDevOps: initialStatus,
    sharePoint: initialStatus,
    playwright: initialStatus,
  });

  const checkService = useCallback(async (
    name: keyof ServicesStatus,
    url: string
  ): Promise<ServiceStatus> => {
    try {
      const startTime = performance.now();
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);

      if (response.ok) {
        const data = await response.json();
        return {
          isConnected: data.status === 'healthy',
          latency,
          isLoading: false,
          error: null,
        };
      } else {
        return {
          isConnected: false,
          latency: null,
          isLoading: false,
          error: `${name} Server unavailable`,
        };
      }
    } catch (error) {
      return {
        isConnected: false,
        latency: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }, []);

  const checkAllServices = useCallback(async () => {
    // Check all services in parallel for better performance
    const [azureDevOps, sharePoint, playwright] = await Promise.all([
      checkService('azureDevOps', 'http://localhost:3001/health'),
      checkService('sharePoint', 'http://localhost:3002/health'),
      checkService('playwright', 'http://localhost:3003/health'),
    ]);

    setStatus({ azureDevOps, sharePoint, playwright });
  }, [checkService]);

  useEffect(() => {
    // Check immediately
    checkAllServices();

    // Check every 30 seconds (single interval instead of 3)
    const interval = setInterval(checkAllServices, 30000);

    return () => clearInterval(interval);
  }, [checkAllServices]);

  return status;
}

/**
 * Hook to check Azure DevOps connection status via MCP Server
 */

import { useState, useEffect } from 'react';
import { config } from '@/lib/config';

interface AzureDevOpsStatus {
  isConnected: boolean;
  latency: number | null;
  isLoading: boolean;
  error: string | null;
}

export function useAzureDevOpsStatus() {
  const [status, setStatus] = useState<AzureDevOpsStatus>({
    isConnected: false,
    latency: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const checkStatus = async () => {
      try {
        const startTime = performance.now();
        
        // Call the MCP health check endpoint via backend
        const response = await fetch(`${config.api.baseUrl}/api/ai/mcp/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const endTime = performance.now();
        const latency = Math.round(endTime - startTime);

        if (!isMounted) return;

        if (response.ok) {
          const data = await response.json();
          
          setStatus({
            isConnected: data.status === 'healthy',
            latency,
            isLoading: false,
            error: null,
          });
        } else {
          setStatus({
            isConnected: false,
            latency: null,
            isLoading: false,
            error: 'MCP Server unavailable',
          });
        }
      } catch (error) {
        if (!isMounted) return;
        
        setStatus({
          isConnected: false,
          latency: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Connection failed',
        });
      }
    };

    // Check immediately
    checkStatus();

    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return status;
}

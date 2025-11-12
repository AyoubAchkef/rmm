/**
 * Hook to check SharePoint connection status via MCP Server
 */

import { useState, useEffect } from 'react';

interface SharePointStatus {
  isConnected: boolean;
  latency: number | null;
  isLoading: boolean;
  error: string | null;
  isMockMode: boolean;
}

export function useSharePointStatus() {
  const [status, setStatus] = useState<SharePointStatus>({
    isConnected: false,
    latency: null,
    isLoading: true,
    error: null,
    isMockMode: false,
  });

  useEffect(() => {
    let isMounted = true;

    const checkStatus = async () => {
      try {
        const startTime = performance.now();
        
        // Call the MCP SharePoint health check endpoint
        const response = await fetch('http://localhost:3002/health', {
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
            isMockMode: data.mode === 'MOCK',
          });
        } else {
          setStatus({
            isConnected: false,
            latency: null,
            isLoading: false,
            error: 'MCP SharePoint Server unavailable',
            isMockMode: false,
          });
        }
      } catch (error) {
        if (!isMounted) return;
        
        setStatus({
          isConnected: false,
          latency: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Connection failed',
          isMockMode: false,
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

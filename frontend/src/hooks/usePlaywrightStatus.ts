/**
 * Hook to check Playwright connection status via MCP Server
 */

import { useState, useEffect } from 'react';

interface PlaywrightStatus {
  isConnected: boolean;
  latency: number | null;
  isLoading: boolean;
  error: string | null;
}

export function usePlaywrightStatus() {
  const [status, setStatus] = useState<PlaywrightStatus>({
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
        
        // Call the MCP Playwright health check endpoint
        const response = await fetch('http://localhost:3003/health', {
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
            error: 'MCP Playwright Server unavailable',
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

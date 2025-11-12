/**
 * Lazy Loader Component
 * Shows a loading state while lazy-loaded components are being fetched
 */

import { Suspense, ComponentType } from 'react';
import { useTheme } from '@/contexts/theme-context';

interface LazyLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function LazyLoader({ children, fallback }: LazyLoaderProps) {
  const { theme } = useTheme();
  
  const defaultFallback = (
    <div 
      className="flex items-center justify-center w-full h-full min-h-[200px]"
      style={{
        background: theme === 'dark' 
          ? 'rgba(28, 53, 94, 0.3)' 
          : 'rgba(214, 209, 202, 0.25)',
      }}
    >
      <div className="flex flex-col items-center gap-2">
        <div 
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{
            borderColor: theme === 'dark' ? '#CC9F53' : '#1C355E',
            borderTopColor: 'transparent',
          }}
        />
        <p 
          className="text-sm"
          style={{
            color: theme === 'dark' ? '#CC9F53' : '#1C355E',
          }}
        >
          Chargement...
        </p>
      </div>
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
}

/**
 * HOC to wrap a component with lazy loading
 */
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function LazyComponent(props: P) {
    return (
      <LazyLoader fallback={fallback}>
        <Component {...props} />
      </LazyLoader>
    );
  };
}

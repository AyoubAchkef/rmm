'use client';

import { ReactNode } from 'react';
import { useTheme } from '@/contexts/theme-context';

interface MetricCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function MetricCard({ children, className = '', onClick, hoverable = false }: MetricCardProps) {
  const { theme } = useTheme();

  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl border transition-all duration-500 ${
        hoverable ? 'cursor-pointer hover:scale-[1.02] hover:shadow-2xl' : ''
      } ${className}`}
      style={{
        background: theme === 'dark'
          ? 'rgba(28, 53, 94, 0.12)'
          : 'rgba(214, 209, 202, 0.12)',
        backdropFilter: 'blur(20px) saturate(1.5)',
        borderColor: theme === 'dark'
          ? 'rgba(204, 159, 83, 0.2)'
          : 'rgba(214, 209, 202, 0.25)',
        boxShadow: theme === 'dark'
          ? '0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(204, 159, 83, 0.1)'
          : '0 8px 32px rgba(214, 209, 202, 0.12), 0 0 0 1px rgba(214, 209, 202, 0.08)',
      }}
    >
      {/* Gradient Glow on Hover */}
      {hoverable && (
        <div
          className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 pointer-events-none group-hover:opacity-100"
          style={{
            background: theme === 'dark'
              ? 'radial-gradient(circle at top, rgba(204, 159, 83, 0.1), transparent 70%)'
              : 'radial-gradient(circle at top, rgba(28, 53, 94, 0.08), transparent 70%)',
          }}
        />
      )}

      {children}
    </div>
  );
}

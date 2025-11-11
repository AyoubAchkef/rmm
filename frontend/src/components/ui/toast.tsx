'use client';

import { useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';

export type ToastType = 'success' | 'error' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  const { theme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const config = {
    success: {
      icon: CheckCircle2,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)',
    },
    error: {
      icon: XCircle,
      color: '#EF4444',
      bg: 'rgba(239, 68, 68, 0.1)',
    },
    warning: {
      icon: AlertCircle,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)',
    },
  };

  const Icon = config[type].icon;

  return (
    <div
      className="fixed top-6 right-6 z-[100] animate-slideIn"
      style={{
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[320px]"
        style={{
          background: theme === 'dark' ? '#1C355E' : '#57534e',
          border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.15)'}`,
          backdropFilter: 'blur(10px)',
        }}
      >
        <div
          className="p-1.5 rounded"
          style={{
            background: config[type].bg,
          }}
        >
          <Icon className="w-4 h-4" style={{ color: config[type].color }} />
        </div>
        <p className="flex-1 text-sm font-medium" style={{ color: '#FFFFFF' }}>
          {message}
        </p>
        <button
          onClick={onClose}
          className="p-1 rounded transition-colors duration-150"
          style={{ color: 'rgba(255, 255, 255, 0.6)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
          }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

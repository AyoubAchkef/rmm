'use client';

import { useTheme } from '@/contexts/theme-context';
import { useLanguage } from '@/contexts/language-context';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmationModal({
  isOpen,
  title,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center animate-fadeIn"
      style={{
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-md mx-4 animate-scaleIn"
        style={{
          animation: 'scaleIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="rounded-lg p-6"
          style={{
            background: theme === 'dark' ? '#1C355E' : '#57534e',
            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.15)'}`,
          }}
        >
          {/* Close button */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-1 rounded transition-colors duration-150"
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
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div
            className="mb-4 p-3 rounded-lg inline-flex"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
            }}
          >
            <AlertTriangle className="w-6 h-6" style={{ color: '#EF4444' }} />
          </div>

          {/* Title */}
          <h2 className="text-lg font-semibold mb-2" style={{ color: '#FFFFFF' }}>
            {t('documents.deleteModal.title')}
          </h2>

          {/* Message */}
          <p className="text-sm mb-6" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            {t('documents.deleteModal.message')} <span className="font-medium">"{title}"</span> ?
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
              style={{
                background: '#EF4444',
                color: '#FFFFFF',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#DC2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#EF4444';
              }}
            >
              {t('common.delete')}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

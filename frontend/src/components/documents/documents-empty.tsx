'use client';

import { useTheme } from '@/contexts/theme-context';
import { useLanguage } from '@/contexts/language-context';
import { FileText } from 'lucide-react';

interface DocumentsEmptyProps {
  onCreateDocument: (type: string) => void;
  searchQuery?: string;
}

export function DocumentsEmpty({ onCreateDocument, searchQuery }: DocumentsEmptyProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const message = searchQuery
    ? t('documents.emptySearch').replace('{query}', searchQuery)
    : t('documents.empty');

  return (
    <div className="flex flex-col items-center justify-center py-20">
      {/* Icon */}
      <div
        className="mb-6 p-6 rounded-2xl"
        style={{
          background: theme === 'dark' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.06)',
        }}
      >
        <FileText
          className="w-12 h-12"
          strokeWidth={1.5}
          style={{ color: '#3b82f6' }}
        />
      </div>

      {/* Text */}
      <p
        className="text-sm"
        style={{
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(28, 53, 94, 0.5)',
        }}
      >
        {message}
      </p>
    </div>
  );
}

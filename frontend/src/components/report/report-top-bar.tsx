'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/theme-context';
import { useLanguage } from '@/contexts/language-context';
import {
  ArrowLeft,
  Save,
  Download,
  Share2,
  FileText,
  Eye,
  MoreVertical,
  Clock,
  Trash2
} from 'lucide-react';

interface ReportTopBarProps {
  title: string;
  metadata?: {
    fileName: string;
    version: number;
    lastModified: string;
  };
  hasUnsavedChanges?: boolean;
  onSave?: () => void;
  onExport?: (format: 'pdf' | 'html') => void;
  onShare?: () => void;
  onPreview?: () => void;
  onDelete?: () => void;
}

export function ReportTopBar({
  title,
  metadata,
  hasUnsavedChanges = false,
  onSave,
  onExport,
  onShare,
  onPreview,
  onDelete
}: ReportTopBarProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <div
      className="flex items-center justify-between px-6 py-3 border-b"
      style={{
        background: theme === 'dark' ? 'rgba(28, 53, 94, 0.2)' : 'rgba(214, 209, 202, 0.2)',
        borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(28, 53, 94, 0.08)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Left: Back + Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/documents')}
          className="p-2 rounded-lg transition-all duration-150"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'rgba(255, 255, 255, 0.7)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
          }}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5" style={{ color: '#1F6699' }} />
          <div>
            <h1 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>
              {title}
            </h1>
            {metadata && (
              <div className="flex gap-4 text-xs mt-0.5" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                <span>Fichier: {metadata.fileName}</span>
                <span>Version: {metadata.version}</span>
                <span>Dernière modification: {metadata.lastModified}</span>
              </div>
            )}
            {hasUnsavedChanges && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3 h-3" style={{ color: '#CC9F53' }} />
                <span className="text-xs" style={{ color: '#CC9F53' }}>
                  {t('report.unsavedChanges')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Preview Button */}
        <button
          onClick={onPreview}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
          }}
        >
          <Eye className="w-4 h-4" />
          <span>{t('report.preview')}</span>
        </button>

        {/* Save Button */}
        <button
          onClick={onSave}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
          style={{
            background: hasUnsavedChanges ? '#CC9F53' : 'rgba(255, 255, 255, 0.05)',
            color: hasUnsavedChanges ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)',
            border: `1px solid ${hasUnsavedChanges ? '#CC9F53' : 'rgba(255, 255, 255, 0.1)'}`,
          }}
          onMouseEnter={(e) => {
            if (!hasUnsavedChanges) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.color = '#FFFFFF';
            }
          }}
          onMouseLeave={(e) => {
            if (!hasUnsavedChanges) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
            }
          }}
        >
          <Save className="w-4 h-4" />
          <span>{t('report.save')}</span>
        </button>

        {/* Export Menu */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
            style={{
              background: '#1C355E',
              color: '#FFFFFF',
              border: '1px solid #1C355E',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#2A4570';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#1C355E';
            }}
          >
            <Download className="w-4 h-4" />
            <span>{t('report.export')}</span>
          </button>

          {showExportMenu && (
            <div
              className="absolute right-0 top-full mt-2 w-48 rounded-lg overflow-hidden shadow-lg z-50"
              style={{
                background: theme === 'dark' ? '#1C355E' : '#57534e',
                border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.15)'}`,
                backdropFilter: 'blur(10px)',
              }}
            >
              <button
                onClick={() => {
                  onExport?.('pdf');
                  setShowExportMenu(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm transition-colors duration-150"
                style={{ color: '#FFFFFF' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {t('report.exportPDF')}
              </button>
              <button
                onClick={() => {
                  onExport?.('html');
                  setShowExportMenu(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm transition-colors duration-150"
                style={{ color: '#FFFFFF' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {t('report.exportHTML')}
              </button>
            </div>
          )}
        </div>

        {/* Share Button */}
        <button
          onClick={onShare}
          className="p-2 rounded-lg transition-all duration-150"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'rgba(255, 255, 255, 0.7)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
          }}
        >
          <Share2 className="w-4 h-4" />
        </button>

        {/* Delete Button */}
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-2 rounded-lg transition-all duration-150"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: 'rgba(239, 68, 68, 0.7)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
              e.currentTarget.style.color = '#EF4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.color = 'rgba(239, 68, 68, 0.7)';
            }}
            title={t('report.delete')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

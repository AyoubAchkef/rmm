'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/theme-context';
import { useLanguage } from '@/contexts/language-context';
import { Eye, Edit2, Download, Trash2, Rocket, CheckCircle2, Target, Presentation, Calendar } from 'lucide-react';

export interface Document {
  id: string;
  title: string;
  type: 'cr-mep' | 'cr-post-mep' | 'sprint-review' | 'presentation';
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

interface DocumentListItemProps {
  document: Document;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
}

const typeConfig = {
  'cr-mep': {
    label: 'MEP',
    icon: Rocket,
    color: '#FFFFFF', // White text
    bg: '#1F6699', // RMM Chart Blue - Opaque
  },
  'cr-post-mep': {
    label: 'Post-MEP',
    icon: CheckCircle2,
    color: '#FFFFFF', // White text
    bg: '#6E9966', // RMM Chart Green - Opaque
  },
  'sprint-review': {
    label: 'Sprint Review',
    icon: Target,
    color: '#FFFFFF', // White text
    bg: '#992E63', // RMM Chart Magenta - Opaque
  },
  'presentation': {
    label: 'Présentation',
    icon: Presentation,
    color: '#FFFFFF', // White text
    bg: '#CC9F53', // RMM Gold - Opaque
  },
};

export function DocumentListItem({
  document,
  onView,
  onEdit,
  onDownload,
  onDelete,
}: DocumentListItemProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);
  const config = typeConfig[document.type];
  const Icon = config.icon;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div
      className="group relative flex items-center gap-4 py-3 px-4 transition-colors duration-150 cursor-pointer"
      style={{
        background: isHovered
          ? theme === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(28, 53, 94, 0.02)'
          : 'transparent',
        borderBottom: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(28, 53, 94, 0.05)'}`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onView(document.id)}
      onDoubleClick={() => onEdit(document.id)}
    >
      {/* Type Badge - Icon Only */}
      <div
        className="inline-flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150"
        style={{
          background: config.bg,
          color: config.color,
        }}
        title={config.label}
      >
        <Icon className="w-4 h-4" strokeWidth={2.5} />
      </div>

      {/* Title */}
      <div
        className="flex-1 text-sm font-medium"
        style={{ color: '#FFFFFF' }}
      >
        {document.title}
      </div>

      {/* Quick Actions */}
      <div
        className="flex items-center gap-1 transition-opacity duration-200"
        style={{ opacity: isHovered ? 1 : 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView(document.id);
          }}
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
          title={t('documents.actions.view')}
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(document.id);
          }}
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
          title={t('documents.actions.edit')}
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDownload(document.id);
          }}
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
          title={t('documents.actions.download')}
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(document.id);
          }}
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
          title={t('documents.actions.delete')}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Created By */}
      <div
        className="text-xs min-w-[120px]"
        style={{ color: 'rgba(255, 255, 255, 0.6)' }}
      >
        {document.createdBy || '—'}
      </div>

      {/* Date */}
      <div
        className="text-xs flex items-center gap-1.5 min-w-[100px]"
        style={{ color: 'rgba(255, 255, 255, 0.6)' }}
      >
        <Calendar className="w-3.5 h-3.5" strokeWidth={2} />
        <span>{formatDate(document.createdAt)}</span>
      </div>
    </div>
  );
}

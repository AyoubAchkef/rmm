'use client';

import { useTheme } from '@/contexts/theme-context';
import { useLanguage } from '@/contexts/language-context';
import { ChevronDown, ChevronUp } from 'lucide-react';

type SortOption = 'dateDesc' | 'dateAsc' | 'titleAsc' | 'titleDesc';

interface DocumentsTableHeaderProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export function DocumentsTableHeader({ sortBy, onSortChange }: DocumentsTableHeaderProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const getSortIcon = (column: 'title' | 'date') => {
    if (column === 'title') {
      if (sortBy === 'titleAsc') return <ChevronUp className="w-3.5 h-3.5" />;
      if (sortBy === 'titleDesc') return <ChevronDown className="w-3.5 h-3.5" />;
    }
    if (column === 'date') {
      if (sortBy === 'dateDesc') return <ChevronDown className="w-3.5 h-3.5" />;
      if (sortBy === 'dateAsc') return <ChevronUp className="w-3.5 h-3.5" />;
    }
    return null;
  };

  const handleTitleSort = () => {
    if (sortBy === 'titleAsc') {
      onSortChange('titleDesc');
    } else {
      onSortChange('titleAsc');
    }
  };

  const handleDateSort = () => {
    if (sortBy === 'dateDesc') {
      onSortChange('dateAsc');
    } else {
      onSortChange('dateDesc');
    }
  };

  return (
    <div
      className="flex items-center gap-4 py-2 px-4 text-xs font-medium"
      style={{
        color: 'rgba(255, 255, 255, 0.4)',
        borderBottom: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(28, 53, 94, 0.08)'}`,
      }}
    >
      {/* Type Column */}
      <div className="w-7">
        {t('documents.columns.type')}
      </div>

      {/* Title Column - Sortable */}
      <button
        onClick={handleTitleSort}
        className="flex-1 flex items-center gap-1.5 hover:text-white transition-colors duration-150 text-left"
      >
        <span>{t('documents.columns.title')}</span>
        {getSortIcon('title')}
      </button>

      {/* Actions Column - Placeholder */}
      <div className="w-[140px]">
        {t('documents.columns.actions')}
      </div>

      {/* Created By Column */}
      <div className="min-w-[120px]">
        {t('documents.columns.createdBy')}
      </div>

      {/* Date Column - Sortable */}
      <button
        onClick={handleDateSort}
        className="min-w-[100px] flex items-center gap-1.5 hover:text-white transition-colors duration-150"
      >
        <span>{t('documents.columns.date')}</span>
        {getSortIcon('date')}
      </button>
    </div>
  );
}

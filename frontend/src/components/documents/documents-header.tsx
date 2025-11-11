'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Plus, FileText, Rocket, CheckCircle2, Target, Presentation } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import { useLanguage } from '@/contexts/language-context';

interface DocumentsHeaderProps {
  onSearch: (query: string) => void;
  onCreateDocument: (type: string) => void;
}

export function DocumentsHeader({ onSearch, onCreateDocument }: DocumentsHeaderProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const documentTypes = [
    { id: 'cr-mep', label: t('documents.types.crMep'), icon: Rocket, color: '#3b82f6' },
    { id: 'cr-post-mep', label: t('documents.types.postMep'), icon: CheckCircle2, color: '#10b981' },
    { id: 'sprint-review', label: t('documents.types.sprintReview'), icon: Target, color: '#8b5cf6' },
    { id: 'presentation', label: t('documents.types.presentation'), icon: Presentation, color: '#f59e0b' },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowCreateMenu(false);
      }
    };

    if (showCreateMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCreateMenu]);

  return (
    <div className="flex items-center justify-between mb-8 pt-6">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div
          className="p-2.5 rounded-xl"
          style={{
            background: theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)',
          }}
        >
          <FileText
            className="w-5 h-5"
            strokeWidth={2}
            style={{ color: '#3b82f6' }}
          />
        </div>
        <h1
          className="text-2xl font-semibold tracking-tight"
          style={{ color: '#FFFFFF' }}
        >
          {t('documents.title')}
        </h1>
      </div>

      {/* Right side: Search + Create */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div
          className="relative w-80"
          style={{
            borderBottom: `1px solid rgba(255, 255, 255, 0.2)`,
          }}
        >
          <div className="flex items-center py-2">
            <Search
              className="w-4 h-4 mr-2"
              style={{ color: 'rgba(255, 255, 255, 0.6)' }}
            />
            <input
              type="text"
              placeholder={t('documents.search')}
              value={searchQuery}
              onChange={handleSearchChange}
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-sm"
              style={{
                color: '#FFFFFF',
              }}
            />
          </div>
        </div>

        {/* Create Button */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowCreateMenu(!showCreateMenu)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>{t('documents.new')}</span>
          </button>

          {/* Dropdown */}
          {showCreateMenu && (
            <div
              className="absolute right-0 top-full mt-2 w-64 rounded-lg overflow-hidden shadow-lg z-50"
              style={{
                background: theme === 'dark' ? '#1C355E' : '#57534e',
                border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.15)'}`,
                backdropFilter: 'blur(10px)',
              }}
            >
              {documentTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => {
                      onCreateDocument(type.id);
                      setShowCreateMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm transition-colors duration-150 flex items-center gap-3"
                    style={{
                      color: '#FFFFFF',
                      background: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div
                      className="p-1.5 rounded"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <Icon className="w-4 h-4" strokeWidth={2} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                    </div>
                    <span className="font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

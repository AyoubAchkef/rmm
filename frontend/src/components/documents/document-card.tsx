'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/theme-context';
import { MoreVertical, Eye, Edit2, Download, Trash2, Calendar } from 'lucide-react';

export interface Document {
  id: string;
  title: string;
  type: 'cr-mep' | 'cr-post-mep' | 'sprint-review' | 'presentation';
  createdAt: Date;
  updatedAt: Date;
}

interface DocumentCardProps {
  document: Document;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
}

const typeConfig = {
  'cr-mep': { label: 'CR MEP', color: '#1C355E', icon: '📋' },
  'cr-post-mep': { label: 'CR Post-MEP', color: '#CC9F53', icon: '✅' },
  'sprint-review': { label: 'Sprint Review', color: '#E8C9BA', icon: '🎯' },
  'presentation': { label: 'Présentation', color: '#8A1E41', icon: '📊' },
};

export function DocumentCard({
  document,
  onView,
  onEdit,
  onDownload,
  onDelete,
}: DocumentCardProps) {
  const { theme } = useTheme();
  const [showActions, setShowActions] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const config = typeConfig[document.type];

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowActions(false);
      }
    };

    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActions]);

  return (
    <div
      className="group relative p-6 rounded-2xl transition-all duration-500 hover:scale-105"
      style={{
        background: theme === 'dark'
          ? 'rgba(255, 255, 255, 0.05)'
          : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${theme === 'dark' ? 'rgba(204, 159, 83, 0.2)' : 'rgba(28, 53, 94, 0.15)'}`,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          boxShadow: `0 0 30px ${config.color}40`,
        }}
      />

      <div className="relative z-10">
        {/* Header with badge and actions */}
        <div className="flex items-start justify-between mb-4">
          <div
            className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2"
            style={{
              background: `${config.color}20`,
              color: config.color,
              border: `1px solid ${config.color}40`,
            }}
          >
            <span>{config.icon}</span>
            <span>{config.label}</span>
          </div>

          {/* Actions Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 rounded-lg transition-all duration-300 hover:bg-white/10"
              style={{ color: theme === 'dark' ? '#FFFFFF' : '#1C355E' }}
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showActions && (
              <div
                className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden shadow-2xl z-50"
                style={{
                  background: theme === 'dark' ? '#1C355E' : '#FFFFFF',
                  border: `1px solid ${theme === 'dark' ? 'rgba(204, 159, 83, 0.3)' : 'rgba(28, 53, 94, 0.2)'}`,
                  animation: 'slideDown 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                <button
                  onClick={() => {
                    onView(document.id);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2.5 flex items-center gap-3 transition-all duration-200 hover:bg-white/10"
                  style={{ color: theme === 'dark' ? '#FFFFFF' : '#1C355E' }}
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-medium">Voir</span>
                </button>
                <button
                  onClick={() => {
                    onEdit(document.id);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2.5 flex items-center gap-3 transition-all duration-200 hover:bg-white/10"
                  style={{ color: theme === 'dark' ? '#FFFFFF' : '#1C355E' }}
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Modifier</span>
                </button>
                <button
                  onClick={() => {
                    onDownload(document.id);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2.5 flex items-center gap-3 transition-all duration-200 hover:bg-white/10"
                  style={{ color: theme === 'dark' ? '#FFFFFF' : '#1C355E' }}
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-medium">Télécharger</span>
                </button>
                <button
                  onClick={() => {
                    onDelete(document.id);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2.5 flex items-center gap-3 transition-all duration-200 hover:bg-red-500/20"
                  style={{ color: '#EF4444' }}
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Supprimer</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h3
          className="font-bold text-lg mb-3 line-clamp-2"
          style={{ color: theme === 'dark' ? '#FFFFFF' : '#1C355E' }}
        >
          {document.title}
        </h3>

        {/* Date */}
        <div
          className="flex items-center gap-2 text-sm"
          style={{
            color: theme === 'dark'
              ? 'rgba(255, 255, 255, 0.6)'
              : 'rgba(28, 53, 94, 0.7)',
          }}
        >
          <Calendar className="w-4 h-4" />
          <span>{formatDate(document.createdAt)}</span>
        </div>

        {/* Quick Actions Footer */}
        <div className="mt-4 pt-4 border-t flex gap-2" style={{
          borderColor: theme === 'dark'
            ? 'rgba(204, 159, 83, 0.15)'
            : 'rgba(28, 53, 94, 0.15)',
        }}>
          <button
            onClick={() => onView(document.id)}
            className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105"
            style={{
              background: theme === 'dark'
                ? 'rgba(204, 159, 83, 0.15)'
                : 'rgba(28, 53, 94, 0.1)',
              color: theme === 'dark' ? '#CC9F53' : '#1C355E',
            }}
          >
            Ouvrir
          </button>
          <button
            onClick={() => onEdit(document.id)}
            className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105"
            style={{
              background: config.color,
              color: '#FFFFFF',
            }}
          >
            Modifier
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

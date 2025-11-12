'use client';

import { MetricCard } from './metric-card';
import { useTheme } from '@/contexts/theme-context';
import { useLanguage } from '@/contexts/language-context';
import { FileText, FlaskConical, FileSpreadsheet, BarChart3, Plus } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { LottieIcon } from './lottie-icon';
import { SIMPLE_ANIMATIONS } from './lottie-animations';

interface QuickAction {
  icon: React.ElementType;
  labelKey: string;
  action: () => void;
}

export function QuickActionsCard() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showDocumentMenu, setShowDocumentMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowDocumentMenu(false);
      }
    };

    if (showDocumentMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDocumentMenu]);

  const documentTypes = [
    {
      label: 'CR Mise en Production',
      path: '/cr-mep/create',
      icon: FileText,
      color: '#1F6699'
    },
    {
      label: 'CR Post-MEP',
      path: '/cr-post-mep/create',
      icon: FileSpreadsheet,
      color: '#CC9F53'
    },
    {
      label: 'Sprint Review',
      path: '/sprint-review/create',
      icon: BarChart3,
      color: '#28A745'
    },
    {
      label: 'Présentation',
      path: '/presentation/create',
      icon: FileText,
      color: '#DC3545'
    }
  ];

  const handleDocumentMenuToggle = () => {
    if (!showDocumentMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
    setShowDocumentMenu(!showDocumentMenu);
  };

  const actions: QuickAction[] = [
    {
      icon: FileText,
      labelKey: 'createUS',
      action: () => {}, // TODO: Implement create US functionality
    },
    {
      icon: FlaskConical,
      labelKey: 'generateTests',
      action: () => {}, // TODO: Implement generate tests functionality
    },
    {
      icon: Plus,
      labelKey: 'generateDocument',
      action: handleDocumentMenuToggle,
    },
    {
      icon: BarChart3,
      labelKey: 'analyzeSprint',
      action: () => {}, // TODO: Implement analyze sprint functionality
    },
  ];

  return (
    <MetricCard className="p-4 h-full">
      {/* Title with Lottie Icon */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8">
          <LottieIcon animationData={SIMPLE_ANIMATIONS.robot} className="w-full h-full" />
        </div>
        <h3
          className="text-sm font-semibold"
          style={{
            color: theme === 'dark' ? '#CC9F53' : '#FFFFFF',
          }}
        >
          {t('dashboard.metrics.quickActions.title')}
        </h3>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action, index) => {
          const Icon = action.icon;
          const isHovered = hoveredIndex === index;
          const isDocumentButton = index === 2;

          return (
            <div key={index} className="relative w-full h-full">
              <button
              ref={isDocumentButton ? buttonRef : undefined}
              onClick={action.action}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="relative group rounded-xl p-3 transition-all duration-300 overflow-hidden w-full h-full"
              style={{
                background: isHovered
                  ? theme === 'dark'
                    ? 'rgba(204, 159, 83, 0.15)'
                    : 'rgba(28, 53, 94, 0.12)'
                  : theme === 'dark'
                  ? 'rgba(28, 53, 94, 0.2)'
                  : 'rgba(214, 209, 202, 0.25)',
                border: `1px solid ${
                  isHovered
                    ? theme === 'dark'
                      ? 'rgba(204, 159, 83, 0.4)'
                      : 'rgba(28, 53, 94, 0.3)'
                    : theme === 'dark'
                    ? 'rgba(204, 159, 83, 0.2)'
                    : 'rgba(28, 53, 94, 0.15)'
                }`,
                transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: isHovered
                  ? theme === 'dark'
                    ? '0 8px 24px rgba(204, 159, 83, 0.2)'
                    : '0 8px 24px rgba(28, 53, 94, 0.15)'
                  : 'none',
              }}
            >
              {/* Animated Background Gradient */}
              <div
                className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500"
                style={{
                  background:
                    theme === 'dark'
                      ? 'radial-gradient(circle at center, rgba(204, 159, 83, 0.1), transparent 70%)'
                      : 'radial-gradient(circle at center, rgba(28, 53, 94, 0.08), transparent 70%)',
                  opacity: isHovered ? 1 : 0,
                }}
              />

              {/* Content */}
              <div className="relative flex flex-col items-center gap-2">
                {/* Icon */}
                <div
                  style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                  }}
                >
                  <Icon
                    className="w-5 h-5 transition-transform duration-300"
                    style={{
                      transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                    } as React.CSSProperties}
                  />
                </div>

                {/* Label */}
                <span
                  className="text-xs font-medium text-center leading-tight transition-colors duration-300"
                  style={{
                    color: isHovered
                      ? theme === 'dark'
                        ? '#CC9F53'
                        : '#FFFFFF'
                      : theme === 'dark'
                      ? '#D6D1CA'
                      : 'rgba(255, 255, 255, 0.7)',
                  }}
                >
                  {t(`dashboard.metrics.quickActions.${action.labelKey}`)}
                </span>
              </div>

              {/* Shine Effect on Hover */}
              <div
                className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 pointer-events-none"
                style={{
                  opacity: isHovered ? 1 : 0,
                }}
              >
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full transition-transform duration-1000"
                  style={{
                    transform: isHovered ? 'translateX(100%)' : 'translateX(-100%)',
                  }}
                />
              </div>
            </button>
          </div>
          );
        })}
      </div>

      {/* Document Type Dropdown Menu - Rendered via Portal */}
      {showDocumentMenu && menuPosition && typeof window !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          className="w-64 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          style={{
            position: 'fixed',
            top: menuPosition.top,
            left: menuPosition.left,
            background: theme === 'dark' ? 'rgba(28, 53, 94, 0.95)' : 'rgba(214, 209, 202, 0.95)',
            border: `1px solid ${theme === 'dark' ? 'rgba(204, 159, 83, 0.3)' : 'rgba(28, 53, 94, 0.2)'}`,
            boxShadow: theme === 'dark'
              ? '0 12px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(204, 159, 83, 0.1)'
              : '0 12px 32px rgba(0, 0, 0, 0.15)',
            backdropFilter: 'blur(12px)',
            zIndex: 9999,
          }}
        >
          {documentTypes.map((docType, docIndex) => {
            const DocIcon = docType.icon;
            return (
              <button
                key={docIndex}
                onClick={() => {
                  router.push(docType.path);
                  setShowDocumentMenu(false);
                }}
                className="w-full px-4 py-3 flex items-center gap-3 transition-all duration-200"
                style={{
                  background: 'transparent',
                  borderBottom: docIndex < documentTypes.length - 1
                    ? `1px solid ${theme === 'dark' ? 'rgba(204, 159, 83, 0.1)' : 'rgba(28, 53, 94, 0.1)'}`
                    : 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme === 'dark'
                    ? 'rgba(204, 159, 83, 0.15)'
                    : 'rgba(28, 53, 94, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: `${docType.color}20`,
                  }}
                >
                  <DocIcon className="w-4 h-4" style={{ color: docType.color }} />
                </div>
                <span
                  className="text-sm font-medium"
                  style={{
                    color: theme === 'dark' ? '#FFFFFF' : '#1C355E',
                  }}
                >
                  {docType.label}
                </span>
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </MetricCard>
  );
}

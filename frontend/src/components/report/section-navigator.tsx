'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/theme-context';
import { useLanguage } from '@/contexts/language-context';
import {
  Rocket,
  BarChart3,
  FileText,
  Activity,
  AlertTriangle,
  Users,
  ClipboardCheck,
  CheckCircle2,
  Target,
  Sparkles
} from 'lucide-react';
import { SectionType } from '@/types/report';

interface Section {
  id: string;
  type: SectionType;
  icon: any;
  order: number;
}

interface SectionNavigatorProps {
  activeSection: string | null;
  onSectionChange: (sectionId: string) => void;
}

const sectionsConfig: Section[] = [
  { id: 'hero', type: 'hero', icon: Rocket, order: 1 },
  { id: 'synthese', type: 'synthese', icon: BarChart3, order: 2 },
  { id: 'bilan', type: 'bilan', icon: FileText, order: 3 },
  { id: 'metriques', type: 'metriques', icon: Activity, order: 4 },
  { id: 'defauts', type: 'defauts', icon: AlertTriangle, order: 5 },
  { id: 'userStories', type: 'user-stories', icon: Users, order: 6 },
  { id: 'planTest', type: 'plan-test', icon: ClipboardCheck, order: 7 },
  { id: 'validationBusiness', type: 'validation-business', icon: CheckCircle2, order: 8 },
  { id: 'bilanRecommandations', type: 'bilan-recommandations', icon: Target, order: 9 },
  { id: 'conclusion', type: 'conclusion', icon: Sparkles, order: 10 },
];

export function SectionNavigator({ activeSection, onSectionChange }: SectionNavigatorProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  return (
    <div
      className="h-full flex flex-col"
      style={{
        background: theme === 'dark' ? 'rgba(28, 53, 94, 0.3)' : 'rgba(214, 209, 202, 0.3)',
        borderRight: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(28, 53, 94, 0.08)'}`,
      }}
    >
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(28, 53, 94, 0.08)' }}>
        <h3 className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
          {t('report.structure')}
        </h3>
        <p className="text-xs mt-1" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
          {t('report.sectionsCount', { count: sectionsConfig.length })}
        </p>
      </div>

      {/* Sections List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
        {sectionsConfig.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.type;

          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.type)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group"
              style={{
                background: isActive
                  ? 'rgba(204, 159, 83, 0.15)'
                  : 'transparent',
                borderLeft: isActive
                  ? '3px solid #CC9F53'
                  : '3px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <div
                className="p-1.5 rounded"
                style={{
                  background: isActive
                    ? 'rgba(204, 159, 83, 0.2)'
                    : 'rgba(255, 255, 255, 0.05)',
                }}
              >
                <Icon
                  className="w-4 h-4"
                  style={{
                    color: isActive ? '#CC9F53' : 'rgba(255, 255, 255, 0.6)',
                  }}
                />
              </div>

              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <span
                    className="text-sm font-medium"
                    style={{
                      color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)',
                    }}
                  >
                    {t(`report.sections.${section.id}`)}
                  </span>
                  <span
                    className="text-xs"
                    style={{
                      color: isActive ? '#CC9F53' : 'rgba(255, 255, 255, 0.4)',
                    }}
                  >
                    {section.order}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="p-4 border-t"
        style={{ borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(28, 53, 94, 0.08)' }}
      >
        <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
          <div className="w-2 h-2 rounded-full" style={{ background: '#10b981' }}></div>
          {t('report.allSections')}
        </div>
      </div>
    </div>
  );
}

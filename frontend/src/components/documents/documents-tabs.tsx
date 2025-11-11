'use client';

import { useRef, useEffect, useState } from 'react';
import { useTheme } from '@/contexts/theme-context';
import { useLanguage } from '@/contexts/language-context';
import { Layers, Rocket, CheckCircle2, Target, Presentation } from 'lucide-react';

export type DocumentTab = 'all' | 'cr-mep' | 'cr-post-mep' | 'sprint-review' | 'presentation';

interface DocumentsTabsProps {
  activeTab: DocumentTab;
  onTabChange: (tab: DocumentTab) => void;
  counts: Record<DocumentTab, number>;
}

export function DocumentsTabs({ activeTab, onTabChange, counts }: DocumentsTabsProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const tabs = [
    { id: 'all' as DocumentTab, label: t('documents.tabs.all'), icon: Layers },
    { id: 'cr-mep' as DocumentTab, label: t('documents.tabs.crMep'), icon: Rocket },
    { id: 'cr-post-mep' as DocumentTab, label: t('documents.tabs.postMep'), icon: CheckCircle2 },
    { id: 'sprint-review' as DocumentTab, label: t('documents.tabs.sprintReview'), icon: Target },
    { id: 'presentation' as DocumentTab, label: t('documents.tabs.presentations'), icon: Presentation },
  ];
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);
    const activeTabElement = tabsRef.current[activeIndex];

    if (activeTabElement) {
      setUnderlineStyle({
        left: activeTabElement.offsetLeft,
        width: activeTabElement.offsetWidth,
      });
    }
  }, [activeTab]);

  return (
    <div className="relative mb-6">
      {/* Tabs */}
      <div className="flex items-center gap-6 relative">
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          const count = counts[tab.id] || 0;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabsRef.current[index] = el;
              }}
              onClick={() => onTabChange(tab.id)}
              className="relative py-2 text-sm font-medium transition-colors duration-200 flex items-center gap-2"
              style={{
                color: isActive
                  ? '#FFFFFF'
                  : 'rgba(255, 255, 255, 0.5)',
              }}
            >
              <Icon className="w-4 h-4" strokeWidth={2} />
              <span>{tab.label}</span>
              {count > 0 && (
                <span
                  className="ml-1.5 text-xs"
                  style={{
                    color: 'rgba(255, 255, 255, 0.5)',
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Underline */}
      <div
        className="absolute bottom-0 h-px transition-all duration-300 ease-out"
        style={{
          left: `${underlineStyle.left}px`,
          width: `${underlineStyle.width}px`,
          background: '#FFFFFF',
        }}
      />

      {/* Base line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: 'rgba(255, 255, 255, 0.2)',
        }}
      />
    </div>
  );
}

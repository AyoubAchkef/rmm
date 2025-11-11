'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/theme-context';
import { useLanguage } from '@/contexts/language-context';
import { NavItem } from './nav-item';
import {
  LayoutDashboard,
  FileText,
  FlaskConical,
  BookOpen,
  History,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  User
} from 'lucide-react';

interface DashboardSidebarProps {
  onExpandChange?: (isExpanded: boolean) => void;
}

export function DashboardSidebar({ onExpandChange }: DashboardSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  const { theme } = useTheme();
  const { t } = useLanguage();

  const handleMouseEnter = () => {
    setIsExpanded(true);
    onExpandChange?.(true);
  };

  const handleMouseLeave = () => {
    setIsExpanded(false);
    onExpandChange?.(false);
  };

  const mainNavItems = [
    { icon: LayoutDashboard, label: t('sidebar.dashboard'), href: '/dashboard' },
    { icon: FileText, label: t('sidebar.documents'), href: '/documents' },
    { icon: FlaskConical, label: t('sidebar.testing'), href: '/dashboard/testing' },
    { icon: BookOpen, label: t('sidebar.userStory'), href: '/dashboard/user-story' },
    { icon: History, label: t('sidebar.history'), href: '/dashboard/historique' },
    { icon: BarChart3, label: t('sidebar.analytics'), href: '/dashboard/analytics' },
    { icon: Users, label: t('sidebar.team'), href: '/dashboard/equipe' },
  ];

  const bottomNavItems = [
    { icon: Settings, label: t('sidebar.settings'), href: '/dashboard/settings' },
    { icon: HelpCircle, label: t('sidebar.help'), href: '/dashboard/aide' },
    { icon: User, label: t('sidebar.profile'), href: '/dashboard/profil' },
  ];

  return (
    <aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="absolute left-4 top-4 bottom-4 z-50 transition-all duration-300 ease-out"
      style={{
        width: isExpanded ? '240px' : '64px',
      }}
    >
      {/* Glassmorphism Container */}
      <div
        className="h-full rounded-3xl border transition-all duration-300"
        style={{
          background: theme === 'dark'
            ? 'rgba(28, 53, 94, 0.15)'
            : 'rgba(214, 209, 202, 0.25)',
          backdropFilter: 'blur(20px) saturate(1.5)',
          borderColor: theme === 'dark'
            ? 'rgba(204, 159, 83, 0.2)'
            : 'rgba(28, 53, 94, 0.25)',
          boxShadow: theme === 'dark'
            ? '0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(204, 159, 83, 0.1)'
            : '0 8px 32px rgba(28, 53, 94, 0.15), 0 0 0 1px rgba(28, 53, 94, 0.1)',
        }}
      >
        <div className="flex flex-col h-full py-6">
          {/* Main Navigation */}
          <nav className="flex-1 px-2 space-y-1 overflow-y-auto scrollbar-hide">
            {mainNavItems.map((item) => (
              <NavItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                isActive={pathname === item.href}
                isExpanded={isExpanded}
              />
            ))}
          </nav>

          {/* Bottom Navigation */}
          <div className="px-2 pt-4 border-t space-y-1"
            style={{
              borderColor: theme === 'dark'
                ? 'rgba(204, 159, 83, 0.15)'
                : 'rgba(28, 53, 94, 0.2)',
            }}
          >
            {bottomNavItems.map((item) => (
              <NavItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                isActive={pathname === item.href}
                isExpanded={isExpanded}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

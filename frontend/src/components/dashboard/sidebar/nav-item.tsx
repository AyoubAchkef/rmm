'use client';

import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  isActive: boolean;
  isExpanded: boolean;
  badge?: number;
}

export function NavItem({ icon: Icon, label, href, isActive, isExpanded, badge }: NavItemProps) {
  const { theme } = useTheme();

  return (
    <Link
      href={href}
      className="group relative flex items-center h-12 rounded-xl transition-all duration-200"
      style={{
        background: isActive
          ? theme === 'dark'
            ? 'rgba(204, 159, 83, 0.15)'
            : 'rgba(204, 159, 83, 0.12)'
          : 'transparent',
      }}
    >
      {/* Active Indicator - Vertical Gold Bar */}
      {isActive && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full transition-all duration-200"
          style={{
            background: 'linear-gradient(180deg, #CC9F53, #D7B275)',
            boxShadow: '0 0 8px rgba(204, 159, 83, 0.5)',
          }}
        />
      )}

      {/* Icon Container */}
      <div className="flex items-center justify-center min-w-[48px] relative">
        <Icon
          className="transition-all duration-200 group-hover:scale-110"
          size={20}
          style={{
            color: isActive
              ? '#CC9F53'
              : theme === 'dark'
              ? '#FFFFFF'
              : '#1C355E',
            strokeWidth: isActive ? 2.5 : 2.2,
          }}
        />

        {/* Badge */}
        {badge && badge > 0 && (
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
            style={{
              background: '#CC9F53',
              color: '#1C355E',
            }}
          >
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </div>

      {/* Label - Only visible when expanded */}
      <span
        className="ml-3 font-medium text-sm whitespace-nowrap transition-all duration-300"
        style={{
          opacity: isExpanded ? 1 : 0,
          transform: isExpanded ? 'translateX(0)' : 'translateX(-10px)',
          color: isActive
            ? '#CC9F53'
            : theme === 'dark'
            ? '#FFFFFF'
            : '#1C355E',
        }}
      >
        {label}
      </span>

      {/* Hover Effect Background */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
        style={{
          background: theme === 'dark'
            ? 'linear-gradient(90deg, rgba(204, 159, 83, 0.1), rgba(204, 159, 83, 0.05))'
            : 'linear-gradient(90deg, rgba(28, 53, 94, 0.08), rgba(28, 53, 94, 0.04))',
        }}
      />
    </Link>
  );
}

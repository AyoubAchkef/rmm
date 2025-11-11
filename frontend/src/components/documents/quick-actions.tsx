'use client';

import { useTheme } from '@/contexts/theme-context';
import { FileText, CheckCircle2, Target, Presentation } from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  glowColor: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'cr-mep',
    title: 'CR Mise en Production',
    description: 'Générer un compte-rendu de MEP',
    icon: FileText,
    color: '#1C355E',
    glowColor: 'rgba(28, 53, 94, 0.4)',
  },
  {
    id: 'cr-post-mep',
    title: 'CR Post-MEP',
    description: 'Compte-rendu post-mise en production',
    icon: CheckCircle2,
    color: '#CC9F53',
    glowColor: 'rgba(204, 159, 83, 0.4)',
  },
  {
    id: 'sprint-review',
    title: 'Sprint Review',
    description: 'Créer une revue de sprint',
    icon: Target,
    color: '#E8C9BA',
    glowColor: 'rgba(232, 201, 186, 0.4)',
  },
  {
    id: 'presentation',
    title: 'Présentation',
    description: 'Générer un document de présentation',
    icon: Presentation,
    color: '#8A1E41',
    glowColor: 'rgba(138, 30, 65, 0.4)',
  },
];

interface QuickActionsProps {
  onCreateDocument: (type: string) => void;
}

export function QuickActions({ onCreateDocument }: QuickActionsProps) {
  const { theme } = useTheme();

  return (
    <div className="mb-8">
      <h2
        className="text-xl font-bold mb-4"
        style={{ color: theme === 'dark' ? '#FFFFFF' : '#1C355E' }}
      >
        Actions Rapides
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.id}
              onClick={() => onCreateDocument(action.id)}
              className="group relative p-6 rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95"
              style={{
                background: theme === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${theme === 'dark' ? 'rgba(204, 159, 83, 0.2)' : 'rgba(28, 53, 94, 0.15)'}`,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              }}
            >
              {/* Hover glow effect */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  boxShadow: `0 0 40px ${action.glowColor}, 0 0 80px ${action.glowColor}`,
                }}
              />

              {/* Content */}
              <div className="relative z-10">
                {/* Icon Container */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
                  style={{
                    background: `${action.color}20`,
                    border: `2px solid ${action.color}40`,
                  }}
                >
                  <Icon className="w-7 h-7" style={{ color: action.color }} />
                </div>

                {/* Text */}
                <h3
                  className="font-bold text-lg mb-2 transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#FFFFFF' : '#1C355E' }}
                >
                  {action.title}
                </h3>
                <p
                  className="text-sm"
                  style={{
                    color: theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.6)'
                      : 'rgba(28, 53, 94, 0.7)',
                  }}
                >
                  {action.description}
                </p>

                {/* Button */}
                <div
                  className="mt-4 px-4 py-2 rounded-lg font-semibold text-sm text-center transition-all duration-300 group-hover:shadow-lg"
                  style={{
                    background: action.color,
                    color: '#FFFFFF',
                  }}
                >
                  Créer
                </div>
              </div>

              {/* Shine effect on hover */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

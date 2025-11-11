'use client';

import { MetricCard } from './metric-card';
import { useTheme } from '@/contexts/theme-context';
import { useLanguage } from '@/contexts/language-context';
import { TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { LottieIcon } from './lottie-icon';
import { SIMPLE_ANIMATIONS } from './lottie-animations';

export function AIActivityCard() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [count, setCount] = useState(0);

  // Mock data for sparkline (7 days)
  const weekData = [45, 52, 38, 67, 73, 58, 84];
  const maxValue = Math.max(...weekData);

  // Animated counter
  useEffect(() => {
    let current = 0;
    const target = 84;
    const increment = target / 50;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 20);

    return () => clearInterval(timer);
  }, []);

  return (
    <MetricCard className="p-4 h-full">
      {/* Title with Lottie Icon */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8">
          <LottieIcon animationData={SIMPLE_ANIMATIONS.chart} className="w-full h-full" />
        </div>
        <h3
          className="text-sm font-semibold"
          style={{
            color: theme === 'dark' ? '#CC9F53' : '#FFFFFF',
          }}
        >
          {t('dashboard.metrics.aiActivity.title')}
        </h3>
      </div>

      {/* Main Counter */}
      <div className="flex items-baseline gap-1.5 mb-3">
        <span
          className="text-3xl font-bold tabular-nums"
          style={{
            color: '#FFFFFF',
          }}
        >
          {count}
        </span>
        <span
          className="text-[10px] font-medium"
          style={{
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          {t('dashboard.metrics.aiActivity.actionsToday')}
        </span>
      </div>

      {/* Sparkline Chart */}
      <div className="relative">
        <div
          className="text-[10px] font-medium mb-2"
          style={{
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          {t('dashboard.metrics.aiActivity.thisWeek')}
        </div>

        {/* Chart */}
        <div className="h-12 flex items-end gap-1">
          {weekData.map((value, index) => {
            const height = (value / maxValue) * 100;
            const isToday = index === weekData.length - 1;

            return (
              <div
                key={index}
                className="flex-1 rounded-t-sm transition-all duration-500 relative group cursor-pointer"
                style={{
                  height: `${height}%`,
                  background: isToday
                    ? theme === 'dark'
                      ? 'linear-gradient(to top, #CC9F53, rgba(204, 159, 83, 0.6))'
                      : 'linear-gradient(to top, #1C355E, rgba(28, 53, 94, 0.6))'
                    : theme === 'dark'
                    ? 'rgba(204, 159, 83, 0.3)'
                    : 'rgba(28, 53, 94, 0.3)',
                  animationDelay: `${index * 100}ms`,
                  animationName: 'slideUp',
                  animationDuration: '600ms',
                  animationFillMode: 'backwards',
                }}
              >
                {/* Tooltip on hover */}
                <div
                  className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap text-[9px] font-semibold pointer-events-none"
                  style={{
                    background: theme === 'dark' ? '#1C355E' : 'rgba(28, 53, 94, 0.95)',
                    color: theme === 'dark' ? '#CC9F53' : '#FFFFFF',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  {value}
                </div>
              </div>
            );
          })}
        </div>

        {/* Days Labels */}
        <div className="flex gap-1 mt-1">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
            <div
              key={index}
              className="flex-1 text-center text-[8px] font-medium"
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                opacity: index === 6 ? 1 : 0.7,
              }}
            >
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Most Used Badge */}
      <div className="mt-2 pt-2 border-t" style={{ borderColor: theme === 'dark' ? 'rgba(204, 159, 83, 0.1)' : 'rgba(28, 53, 94, 0.1)' }}>
        <div className="flex items-center justify-between">
          <span
            className="text-[9px] font-medium"
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            {t('dashboard.metrics.aiActivity.mostUsed')}
          </span>
          <div
            className="px-2 py-0.5 rounded-full text-[9px] font-semibold"
            style={{
              background: theme === 'dark' ? 'rgba(204, 159, 83, 0.15)' : 'rgba(28, 53, 94, 0.1)',
              color: theme === 'dark' ? '#CC9F53' : '#FFFFFF',
            }}
          >
            {t('dashboard.metrics.quickActions.generateTests')}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: scaleY(0);
            transform-origin: bottom;
          }
          to {
            transform: scaleY(1);
            transform-origin: bottom;
          }
        }
      `}</style>
    </MetricCard>
  );
}

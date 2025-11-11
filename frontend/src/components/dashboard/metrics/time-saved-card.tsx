'use client';

import { MetricCard } from './metric-card';
import { useTheme } from '@/contexts/theme-context';
import { useLanguage } from '@/contexts/language-context';
import { Clock, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { LottieIcon } from './lottie-icon';
import { SIMPLE_ANIMATIONS } from './lottie-animations';

export function TimeSavedCard() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [hours, setHours] = useState(0);
  const [days, setDays] = useState(0);

  const targetHours = 127;
  const targetDays = 5.3;

  // Animated counter for hours
  useEffect(() => {
    let current = 0;
    const increment = targetHours / 60;
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetHours) {
        setHours(targetHours);
        clearInterval(timer);
      } else {
        setHours(Math.floor(current));
      }
    }, 20);

    return () => clearInterval(timer);
  }, []);

  // Animated counter for days
  useEffect(() => {
    let current = 0;
    const increment = targetDays / 60;
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetDays) {
        setDays(targetDays);
        clearInterval(timer);
      } else {
        setDays(Math.round(current * 10) / 10);
      }
    }, 20);

    return () => clearInterval(timer);
  }, []);

  return (
    <MetricCard className="p-4 h-full relative overflow-hidden">
      {/* Animated Background Glow */}
      <div
        className="absolute -top-10 -right-10 w-20 h-20 rounded-full blur-2xl opacity-15 animate-pulse"
        style={{
          background: theme === 'dark' ? '#CC9F53' : '#1C355E',
        }}
      />

      {/* Title */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8">
            <LottieIcon animationData={SIMPLE_ANIMATIONS.clock} className="w-full h-full" />
          </div>
          <h3
            className="text-sm font-semibold"
            style={{
              color: theme === 'dark' ? '#CC9F53' : '#FFFFFF',
            }}
          >
            {t('dashboard.metrics.timeSaved.title')}
          </h3>
        </div>

        {/* Main Counter with Icon */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className="p-1.5 rounded-lg"
            style={{
              background: theme === 'dark' ? 'rgba(204, 159, 83, 0.15)' : 'rgba(28, 53, 94, 0.1)',
            }}
          >
            <Clock
              className="w-4 h-4"
              style={{
                color: theme === 'dark' ? '#CC9F53' : '#1C355E',
              }}
            />
          </div>

          <div>
            <div className="flex items-baseline gap-1">
              <span
                className="text-3xl font-bold tabular-nums"
                style={{
                  color: '#FFFFFF',
                }}
              >
                {hours}
              </span>
              <span
                className="text-[10px] font-medium"
                style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                }}
              >
                {t('dashboard.metrics.timeSaved.hours')}
              </span>
            </div>
            <div
              className="text-[9px] font-medium mt-0.5"
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              {t('dashboard.metrics.timeSaved.thisMonth')}
            </div>
          </div>
        </div>

        {/* Days Equivalent */}
        <div
          className="rounded-lg p-2 mb-2"
          style={{
            background: theme === 'dark' ? 'rgba(204, 159, 83, 0.08)' : 'rgba(28, 53, 94, 0.06)',
            border: `1px solid ${theme === 'dark' ? 'rgba(204, 159, 83, 0.15)' : 'rgba(28, 53, 94, 0.1)'}`,
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-[11px] font-medium"
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
              }}
            >
              ≈ {days} {t('dashboard.metrics.timeSaved.days')}
            </span>
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{
                background: theme === 'dark' ? 'rgba(204, 159, 83, 0.15)' : 'rgba(28, 53, 94, 0.1)',
              }}
            >
              <span
                className="text-xs"
                style={{
                  color: theme === 'dark' ? '#CC9F53' : '#FFFFFF',
                }}
              >
                📅
              </span>
            </div>
          </div>
        </div>

        {/* Trend Comparison */}
        <div
          className="flex items-center justify-between p-2 rounded-lg"
          style={{
            background: theme === 'dark' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(34, 197, 94, 0.06)',
            border: `1px solid rgba(34, 197, 94, 0.15)`,
          }}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="w-2.5 h-2.5 text-green-500" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-green-500">+32%</div>
              <div
                className="text-[8px]"
                style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                }}
              >
                {t('dashboard.metrics.timeSaved.vsLastMonth')}
              </div>
            </div>
          </div>

          {/* Progress Ring */}
          <svg className="w-8 h-8 -rotate-90">
            <circle
              cx="16"
              cy="16"
              r="12"
              fill="none"
              stroke={theme === 'dark' ? 'rgba(204, 159, 83, 0.2)' : 'rgba(28, 53, 94, 0.2)'}
              strokeWidth="2"
            />
            <circle
              cx="16"
              cy="16"
              r="12"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2"
              strokeDasharray="75.4"
              strokeDashoffset={75.4 * (1 - 0.68)}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
            <text
              x="16"
              y="16"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[7px] font-bold rotate-90"
              fill="#22c55e"
              transform="rotate(90 16 16)"
            >
              68%
            </text>
          </svg>
        </div>
      </div>
    </MetricCard>
  );
}

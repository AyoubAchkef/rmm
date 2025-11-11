'use client';

import { useTheme } from '@/contexts/theme-context';
import { useLanguage } from '@/contexts/language-context';
import { MetricCard } from '../metrics/metric-card';
import { LottieIcon } from '../metrics/lottie-icon';
import { SIMPLE_ANIMATIONS } from '../metrics/lottie-animations';
import { Clock } from 'lucide-react';

interface Activity {
  id: string;
  type: 'document' | 'test' | 'analysis' | 'user-story' | 'report';
  title: string;
  description: string;
  timestamp: Date;
  status: 'success' | 'pending' | 'error';
}

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'user-story',
    title: 'User Story créée',
    description: 'US-2547: Interface de connexion',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    status: 'success',
  },
  {
    id: '2',
    type: 'test',
    title: 'Tests générés',
    description: '12 tests unitaires créés',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    status: 'success',
  },
  {
    id: '3',
    type: 'analysis',
    title: 'Analyse Sprint',
    description: 'Sprint 23 - Performance analysée',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'success',
  },
  {
    id: '4',
    type: 'report',
    title: 'Rapport Post-MEP',
    description: 'Déploiement v2.4.0',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    status: 'success',
  },
  {
    id: '5',
    type: 'document',
    title: 'Documentation mise à jour',
    description: 'README.md et CONTRIBUTING.md',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: 'success',
  },
];

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'document':
      return SIMPLE_ANIMATIONS.document;
    case 'test':
      return SIMPLE_ANIMATIONS.checkCircle;
    case 'analysis':
      return SIMPLE_ANIMATIONS.chart;
    case 'user-story':
      return SIMPLE_ANIMATIONS.star;
    case 'report':
      return SIMPLE_ANIMATIONS.document;
    default:
      return SIMPLE_ANIMATIONS.star;
  }
};

const getRelativeTime = (date: Date, t: any) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return t('dashboard.metrics.activity.justNow');
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} min`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}j`;
  }
};

const groupActivitiesByDate = (activities: Activity[]) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  const grouped: { [key: string]: Activity[] } = {
    today: [],
    yesterday: [],
    older: [],
  };

  activities.forEach((activity) => {
    const activityDate = new Date(
      activity.timestamp.getFullYear(),
      activity.timestamp.getMonth(),
      activity.timestamp.getDate()
    );

    if (activityDate.getTime() === today.getTime()) {
      grouped.today.push(activity);
    } else if (activityDate.getTime() === yesterday.getTime()) {
      grouped.yesterday.push(activity);
    } else {
      grouped.older.push(activity);
    }
  });

  return grouped;
};

export function RecentActivity() {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const groupedActivities = groupActivitiesByDate(mockActivities);

  const renderActivityCard = (activity: Activity, isLast: boolean) => (
    <div key={activity.id} className="relative pl-8 pb-6 group">
      {/* Timeline Line */}
      {!isLast && (
        <div
          className="absolute left-[11px] top-8 w-0.5 h-full"
          style={{
            background:
              theme === 'dark'
                ? 'linear-gradient(180deg, rgba(204, 159, 83, 0.3) 0%, rgba(204, 159, 83, 0.1) 100%)'
                : 'linear-gradient(180deg, rgba(28, 53, 94, 0.3) 0%, rgba(28, 53, 94, 0.1) 100%)',
          }}
        />
      )}

      {/* Timeline Dot with Icon */}
      <div
        className="absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300"
        style={{
          background:
            theme === 'dark'
              ? 'linear-gradient(135deg, rgba(204, 159, 83, 0.3), rgba(28, 53, 94, 0.3))'
              : 'linear-gradient(135deg, rgba(204, 159, 83, 0.2), rgba(28, 53, 94, 0.2))',
          border: `2px solid ${theme === 'dark' ? '#CC9F53' : '#1C355E'}`,
          boxShadow: `0 0 12px ${
            theme === 'dark' ? 'rgba(204, 159, 83, 0.3)' : 'rgba(28, 53, 94, 0.3)'
          }`,
        }}
      >
        <div className="w-3 h-3">
          <LottieIcon animationData={getActivityIcon(activity.type)} className="w-full h-full" />
        </div>
      </div>

      {/* Activity Card */}
      <div
        className="relative px-4 py-3 rounded-xl transition-all duration-300 hover:shadow-lg cursor-pointer"
        style={{
          background:
            theme === 'dark'
              ? 'rgba(28, 53, 94, 0.3)'
              : 'rgba(214, 209, 202, 0.25)',
          border: `1px solid ${
            theme === 'dark'
              ? 'rgba(204, 159, 83, 0.2)'
              : 'rgba(28, 53, 94, 0.2)'
          }`,
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4
              className="text-sm font-semibold truncate"
              style={{
                color: '#FFFFFF',
              }}
            >
              {activity.title}
            </h4>
            <p
              className="text-xs mt-1 truncate"
              style={{
                color: theme === 'dark' ? '#D6D1CA' : '#4C4A47',
              }}
            >
              {activity.description}
            </p>
          </div>

          {/* Status Badge */}
          <div
            className="flex-shrink-0 px-2 py-1 rounded-full text-[10px] font-medium"
            style={{
              background:
                activity.status === 'success'
                  ? 'rgba(34, 197, 94, 0.15)'
                  : activity.status === 'pending'
                  ? 'rgba(234, 179, 8, 0.15)'
                  : 'rgba(239, 68, 68, 0.15)',
              color:
                activity.status === 'success'
                  ? '#22c55e'
                  : activity.status === 'pending'
                  ? '#eab308'
                  : '#ef4444',
            }}
          >
            {activity.status === 'success' ? '✓' : activity.status === 'pending' ? '...' : '✗'}
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-1 mt-2">
          <Clock
            className="w-3 h-3"
            style={{
              color: theme === 'dark' ? '#CC9F53' : '#1C355E',
              opacity: 0.5,
            }}
          />
          <span
            className="text-[10px]"
            style={{
              color: theme === 'dark' ? '#D6D1CA' : '#4C4A47',
            }}
          >
            {getRelativeTime(activity.timestamp, t)}
          </span>
        </div>
      </div>
    </div>
  );

  const renderSection = (title: string, activities: Activity[]) => {
    if (activities.length === 0) return null;

    return (
      <div className="mb-6">
        <h3
          className="text-xs font-semibold mb-3 px-2"
          style={{
            color: theme === 'dark' ? '#CC9F53' : '#4C4A47',
          }}
        >
          {title}
        </h3>
        {activities.map((activity, index) =>
          renderActivityCard(activity, index === activities.length - 1 && activities.length > 1)
        )}
      </div>
    );
  };

  return (
    <MetricCard className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8">
          <LottieIcon animationData={SIMPLE_ANIMATIONS.clock} className="w-full h-full" />
        </div>
        <div>
          <h2
            className="text-xl font-bold"
            style={{
              color: theme === 'dark' ? '#CC9F53' : '#FFFFFF',
            }}
          >
            {t('dashboard.metrics.activity.title')}
          </h2>
        </div>
      </div>

      {/* Activities Timeline */}
      <div className="flex-1 overflow-y-auto scrollbar-thin min-h-0 pr-2">
        {renderSection(t('dashboard.metrics.activity.today'), groupedActivities.today)}
        {renderSection(t('dashboard.metrics.activity.yesterday'), groupedActivities.yesterday)}
        {renderSection(t('dashboard.metrics.activity.older'), groupedActivities.older)}
      </div>
    </MetricCard>
  );
}

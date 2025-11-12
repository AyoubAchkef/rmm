'use client';

import { MetricCard } from './metric-card';
import { useTheme } from '@/contexts/theme-context';
import { useLanguage } from '@/contexts/language-context';
import { LottieIcon } from './lottie-icon';
import { SIMPLE_ANIMATIONS } from './lottie-animations';
import Image from 'next/image';
import { useAzureDevOpsStatus } from '@/hooks/useAzureDevOpsStatus';
import { useSharePointStatus } from '@/hooks/useSharePointStatus';
import { usePlaywrightStatus } from '@/hooks/usePlaywrightStatus';

interface Service {
  logo: string;
  nameKey: string;
  status: 'online' | 'offline' | 'loading';
  latency?: number;
  lastSync?: string;
}

export function ConnectedServicesCard() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const azureDevOpsStatus = useAzureDevOpsStatus();
  const sharePointStatus = useSharePointStatus();
  const playwrightStatus = usePlaywrightStatus();

  const services: Service[] = [
    {
      logo: '/azuredevops_logo.png',
      nameKey: 'azureDevOps',
      status: azureDevOpsStatus.isLoading 
        ? 'loading' 
        : azureDevOpsStatus.isConnected 
          ? 'online' 
          : 'offline',
      latency: azureDevOpsStatus.latency ?? undefined,
    },
    {
      logo: '/sharepoint_logo.png',
      nameKey: 'sharePoint',
      status: sharePointStatus.isLoading 
        ? 'loading' 
        : sharePointStatus.isConnected 
          ? 'online' 
          : 'offline',
      latency: sharePointStatus.latency ?? undefined,
    },
    {
      logo: '/playwright_logo.png',
      nameKey: 'playwright',
      status: playwrightStatus.isLoading 
        ? 'loading' 
        : playwrightStatus.isConnected 
          ? 'online' 
          : 'offline',
      latency: playwrightStatus.latency ?? undefined,
    },
  ];

  const allOnline = services.every(s => s.status === 'online');

  return (
    <MetricCard className="p-4 h-full">
      {/* Title with Lottie Icon */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8">
          <LottieIcon animationData={SIMPLE_ANIMATIONS.server} className="w-full h-full" />
        </div>
        <h3
          className="text-sm font-semibold"
          style={{
            color: theme === 'dark' ? '#CC9F53' : '#FFFFFF',
          }}
        >
          {t('dashboard.metrics.services.title')}
        </h3>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-3 gap-3">
        {services.map((service, index) => {
          const isOnline = service.status === 'online';

          return (
            <div
              key={index}
              className="group relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300"
              style={{
                background:
                  theme === 'dark'
                    ? 'rgba(28, 53, 94, 0.3)'
                    : 'rgba(214, 209, 202, 0.25)',
                border: `1px solid ${
                  theme === 'dark'
                    ? 'rgba(204, 159, 83, 0.2)'
                    : 'rgba(214, 209, 202, 0.35)'
                }`,
              }}
            >
              {/* Status Indicator */}
              <div className="absolute top-2 right-2">
                {service.status === 'loading' ? (
                  <div className="relative flex items-center justify-center">
                    <div
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{
                        background: theme === 'dark' ? '#CC9F53' : '#1C355E',
                      }}
                    />
                  </div>
                ) : isOnline ? (
                  <div className="relative flex items-center justify-center">
                    <div
                      className="absolute w-2.5 h-2.5 rounded-full animate-ping"
                      style={{
                        background: 'rgba(34, 197, 94, 0.4)',
                      }}
                    />
                    <div
                      className="relative w-1.5 h-1.5 rounded-full"
                      style={{
                        background: '#22c55e',
                        boxShadow: '0 0 6px rgba(34, 197, 94, 0.6)',
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: '#ef4444',
                      boxShadow: '0 0 6px rgba(239, 68, 68, 0.6)',
                    }}
                  />
                )}
              </div>

              {/* Logo */}
              <div className="relative w-16 h-16 mb-2">
                <Image
                  src={service.logo}
                  alt={t(`dashboard.metrics.services.${service.nameKey}`)}
                  fill
                  className="object-contain"
                />
              </div>

              {/* Latency/Sync Info */}
              {service.status !== 'loading' && (
                <div
                  className="text-[8px] font-medium px-1.5 py-0.5 rounded-full"
                  style={{
                    background:
                      theme === 'dark'
                        ? 'rgba(204, 159, 83, 0.15)'
                        : 'rgba(28, 53, 94, 0.1)',
                    color: theme === 'dark' ? '#CC9F53' : '#FFFFFF',
                  }}
                >
                  {service.latency ? `${service.latency}ms` : service.lastSync}
                </div>
              )}
              {service.status === 'loading' && (
                <div
                  className="text-[8px] font-medium px-1.5 py-0.5 rounded-full"
                  style={{
                    background:
                      theme === 'dark'
                        ? 'rgba(204, 159, 83, 0.15)'
                        : 'rgba(28, 53, 94, 0.1)',
                    color: theme === 'dark' ? '#CC9F53' : '#FFFFFF',
                  }}
                >
                  ...
                </div>
              )}
            </div>
          );
        })}
      </div>
    </MetricCard>
  );
}

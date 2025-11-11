'use client';

import { useState } from 'react';
import Silk from '@/components/ui/silk';
import GlassSurface from '@/components/ui/glass-surface';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { useTheme } from '@/contexts/theme-context';
import {
  QuickActionsCard,
  AIActivityCard,
  TimeSavedCard,
  ConnectedServicesCard,
} from '@/components/dashboard/metrics';
import { ChatAI } from '@/components/dashboard/chat/chat-ai';
import { RecentActivity } from '@/components/dashboard/activity/recent-activity';

export default function DashboardPage() {
  const { theme } = useTheme();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  return (
    <div className="relative w-full min-h-screen">
      {/* Background Silk Animation */}
      <div className="absolute inset-0 w-full h-full">
        <Silk
          speed={5}
          scale={1}
          color={theme === 'dark' ? '#1C355E' : '#D6D1CA'}
          noiseIntensity={1.5}
          rotation={0}
        />
      </div>

      {/* Glass Surface Container */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
        <GlassSurface
          width="calc(100% - 4rem)"
          height="calc(100vh - 4rem)"
          borderRadius={32}
          blur={25}
          opacity={0.12}
          brightness={100}
          backgroundOpacity={0.08}
          displace={2}
          className="glass-dashboard"
          style={{ backdropFilter: 'blur(12px) saturate(1.5)', position: 'relative' }}
        >
          {/* Sidebar - Floating inside GlassSurface */}
          <DashboardSidebar onExpandChange={setIsSidebarExpanded} />

          {/* Main Content with Sidebar Spacing */}
          <div
            className="w-full h-full flex flex-col transition-all duration-300 ease-out"
            style={{
              paddingLeft: isSidebarExpanded ? '256px' : '80px',
            }}
          >
            {/* Header */}
            <DashboardHeader />

            {/* Main Content Area */}
            <div className="flex-1 px-8 pb-6 flex flex-col overflow-hidden">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {/* Quick Actions Card - Spans 1 column */}
                <div className="lg:col-span-1 h-64">
                  <QuickActionsCard />
                </div>

                {/* AI Activity Card - Spans 1 column */}
                <div className="lg:col-span-1 h-64">
                  <AIActivityCard />
                </div>

                {/* Time Saved Card - Spans 1 column */}
                <div className="lg:col-span-1 h-64">
                  <TimeSavedCard />
                </div>

                {/* Connected Services Card - Spans 1 column */}
                <div className="lg:col-span-1 h-64">
                  <ConnectedServicesCard />
                </div>
              </div>

              {/* AI Chat and Activity Section - Takes remaining space */}
              <div className="flex-1 mt-6 min-h-0 flex gap-6">
                {/* Chat AI - 65% */}
                <div className="flex-[0.65] min-w-0">
                  <ChatAI />
                </div>

                {/* Recent Activity - 35% */}
                <div className="flex-[0.35] min-w-0">
                  <RecentActivity />
                </div>
              </div>
            </div>
          </div>
        </GlassSurface>
      </div>
    </div>
  );
}

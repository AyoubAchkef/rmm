'use client';

import Image from 'next/image';
import { useLanguage } from '@/contexts/language-context';
import { useTheme } from '@/contexts/theme-context';
import { ThemeToggleButton } from '@/components/ui/theme-toggle-button';

export function DashboardHeader() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  return (
    <header className="w-full px-8 py-6 flex items-center justify-between">
      {/* Left Section - Logo & Welcome */}
      <div className="flex items-center gap-4">
        <div className="relative w-14 h-14" style={{ filter: theme === 'dark' ? 'brightness(0) saturate(100%) invert(68%) sepia(35%) saturate(456%) hue-rotate(358deg) brightness(92%) contrast(87%)' : 'none' }}>
          <Image
            src="/logo1.png"
            alt="Rothschild & Co"
            fill
            sizes="56px"
            className="object-contain"
            priority
          />
        </div>
        <div>
          <h1 className="text-xl font-bold transition-colors" style={{
            color: '#FFFFFF',
            fontFamily: 'var(--font-calluna)'
          }}>
            {t('header.welcome', { name: 'User' })}
          </h1>
          <p className="text-sm transition-colors" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            {t('header.subtitle')}
          </p>
        </div>
      </div>

      {/* Center Section - Search Bar */}
      <div className="flex-1 max-w-xl mx-8">
        <div className="relative">
          <input
            type="text"
            placeholder={t('header.search')}
            className="w-full h-12 pl-5 pr-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CC9F53] focus:border-transparent transition-all"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#1C355E] hover:bg-[#CC9F53] flex items-center justify-center transition-colors">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Right Section - Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle Button with Circle Blur Animation */}
        <ThemeToggleButton
          theme={theme}
          onClick={toggleTheme}
          variant="circle-blur"
          start="top-right"
        />

        {/* Language Toggle Button */}
        <button
          onClick={toggleLanguage}
          className="relative w-16 h-12 p-0 rounded-full bg-gradient-to-r from-[#1C355E] to-[#2a4a7c] backdrop-blur-sm border border-[#CC9F53]/30 hover:border-[#CC9F53] overflow-hidden transition-all group shadow-lg hover:shadow-[#CC9F53]/20"
          aria-label="Toggle language"
        >
          {/* Animated background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#CC9F53]/0 via-[#CC9F53]/20 to-[#CC9F53]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Language indicator with flip animation */}
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative w-8 h-8 flex items-center justify-center">
              {/* FR Text */}
              <div
                className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                  language === 'fr'
                    ? 'opacity-100 rotate-0 scale-100'
                    : 'opacity-0 rotate-180 scale-50'
                }`}
              >
                <span className="text-sm font-bold text-white">FR</span>
              </div>
              
              {/* EN Text */}
              <div
                className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                  language === 'en'
                    ? 'opacity-100 rotate-0 scale-100'
                    : 'opacity-0 -rotate-180 scale-50'
                }`}
              >
                <span className="text-sm font-bold text-white">EN</span>
              </div>
            </div>
          </div>
          
          {/* Shine effect on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </div>
        </button>

        {/* Notifications Button */}
        <button
          className="relative w-12 h-12 p-0 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 flex items-center justify-center transition-all group"
          aria-label="Notifications"
        >
          <svg
            className="w-5 h-5 text-white group-hover:text-[#CC9F53] transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {/* Notification Badge */}
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#CC9F53] rounded-full"></span>
        </button>
      </div>
    </header>
  );
}

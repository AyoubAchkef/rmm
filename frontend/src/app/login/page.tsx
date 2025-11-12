'use client';

import dynamic from 'next/dynamic';
import { ModernLogin } from '@/components/modern-login';
import { useTheme } from '@/contexts/theme-context';
import { useLanguage } from '@/contexts/language-context';
import { ThemeToggleButton } from '@/components/ui/theme-toggle-button';

// Charger Silk dynamiquement UNIQUEMENT côté client
const Silk = dynamic(() => import('@/components/ui/silk'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-gradient-to-br from-[#1C355E] via-[#0a0a0a] to-[#1C355E]">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_50%,rgba(204,159,83,0.1),transparent_50%)]"></div>
    </div>
  ),
});

export default function LoginPage() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

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

      {/* Theme & Language Toggle Buttons - Top Right */}
      <div className="absolute top-8 right-8 z-20 flex items-center gap-3">
        {/* Theme Toggle Button */}
        <ThemeToggleButton
          theme={theme}
          onClick={toggleTheme}
          variant="circle-blur"
          start="top-right"
          className="!flex !items-center !justify-center"
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
                <span className="text-sm font-bold text-white leading-none">FR</span>
              </div>

              {/* EN Text */}
              <div
                className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                  language === 'en'
                    ? 'opacity-100 rotate-0 scale-100'
                    : 'opacity-0 -rotate-180 scale-50'
                }`}
              >
                <span className="text-sm font-bold text-white leading-none">EN</span>
              </div>
            </div>
          </div>

          {/* Shine effect on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </div>
        </button>
      </div>

      {/* Login Component */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <ModernLogin />
      </div>
    </div>
  );
}

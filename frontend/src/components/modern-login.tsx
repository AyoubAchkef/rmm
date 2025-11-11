'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Input } from '@/components/input';
import { Button } from '@/components/button';
import TextPressure from '@/components/ui/text-pressure';
import TextType from '@/components/ui/text-type';
import { useLanguage } from '@/contexts/language-context';

export function ModernLogin() {
  const [isHoveringSSO, setIsHoveringSSO] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  const handleSSO = () => {
    router.push('/dashboard');
  };

  return (
    <div
      className="relative w-full max-w-6xl mx-auto h-[600px] rounded-3xl overflow-hidden"
      style={{
        boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.4), 0 0 40px rgba(28, 53, 94, 0.2)',
        filter: 'drop-shadow(0 0 20px rgba(28, 53, 94, 0.15))',
      }}
    >
      {/* Background Image - Full Width */}
      <div className="absolute inset-0">
        <Image
          src="/background-login-component.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20" />
        {/* Vignette effect - soft edges */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: 'inset 0 0 80px 40px rgba(0, 0, 0, 0.3)',
          }}
        />
      </div>

      {/* Content Container */}
      <div className="relative h-full flex items-center justify-between px-16">
        {/* Left Side - Branding */}
        <div className="flex-1 text-white max-w-xl">
          <div className="space-y-8">
            <div style={{ height: '180px' }}>
              <TextPressure
                text="AI STUDIO"
                flex={true}
                alpha={false}
                stroke={false}
                width={true}
                weight={true}
                italic={true}
                textColor="#CC9F53"
                minFontSize={48}
              />
            </div>
            
            <div className="text-center space-y-4">
              <TextType
                key={t('login.subtitle')}
                text={t('login.subtitle')}
                as="p"
                className="text-gray-300 text-base leading-relaxed"
                typingSpeed={30}
                showCursor={false}
                loop={false}
              />
            </div>
          </div>
        </div>

        {/* Right Side - Floating Login Form with Glassmorphism */}
        <div className="w-[380px] bg-white/15 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="space-y-6 flex flex-col items-center">
            {/* Logo */}
            <div className="w-20 h-20 relative mx-auto">
              <Image
                src="/logo1.png"
                alt="Rothschild & Co"
                fill
                sizes="80px"
                className="object-contain"
                priority
              />
            </div>

            {/* Login Form */}
            <form className="space-y-4 w-full" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-white block">
                  {t('login.email')}
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('login.emailPlaceholder')}
                  className="h-11 bg-white/20 backdrop-blur-sm border-white/30 focus:border-[#CC9F53] focus:ring-[#CC9F53] text-white placeholder:text-gray-300 w-full"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-semibold text-white">
                    {t('login.password')}
                  </label>
                  <a
                    href="#"
                    className="text-xs text-[#CC9F53] hover:text-[#D7B275] font-medium transition-colors"
                  >
                    {t('login.forgotPassword')}
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder={t('login.passwordPlaceholder')}
                  className="h-11 bg-white/20 backdrop-blur-sm border-white/30 focus:border-[#CC9F53] focus:ring-[#CC9F53] text-white placeholder:text-gray-300 w-full"
                />
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                className="w-full h-11 bg-[#1C355E] hover:bg-[#4A5D7E] text-white font-semibold text-base transition-all duration-300 transform hover:scale-[1.02] mt-2 rounded-md"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {t('login.signIn')}
              </button>

              {/* Divider */}
              <div className="relative py-3 w-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="absolute inset-0" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="w-full border-t border-white/30"></div>
                </div>
                <div className="relative" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="bg-white/15 backdrop-blur-md px-4 text-xs uppercase text-gray-200">or</span>
                </div>
              </div>

              {/* SSO Button */}
              <button
                type="button"
                onClick={handleSSO}
                onMouseEnter={() => setIsHoveringSSO(true)}
                onMouseLeave={() => setIsHoveringSSO(false)}
                className="w-full h-11 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-semibold rounded-md hover:bg-white/20 hover:border-[#CC9F53] transition-all duration-300"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
              >
                <svg
                  className={`w-5 h-5 transition-transform duration-300 ${isHoveringSSO ? 'rotate-12 scale-110' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ flexShrink: 0 }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
                <span style={{ flexShrink: 0 }}>{t('login.signInSSO')}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

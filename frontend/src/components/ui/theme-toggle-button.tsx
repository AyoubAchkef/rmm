'use client';

import { useCallback, useRef } from 'react';

// Extend Document interface for View Transition API
declare global {
  interface Document {
    startViewTransition?: (callback: () => void | Promise<void>) => {
      ready: Promise<void>;
      finished: Promise<void>;
      updateCallbackDone: Promise<void>;
    };
  }
}

interface ThemeToggleButtonProps {
  theme: 'light' | 'dark';
  onClick: () => void;
  variant?: 'circle' | 'circle-blur' | 'polygon' | 'gif';
  start?: 'center' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  url?: string;
  className?: string;
}

export function useThemeTransition() {
  const startTransition = useCallback((callback: () => void) => {
    if (typeof document === 'undefined' || !document.startViewTransition) {
      callback();
      return;
    }

    document.startViewTransition(callback);
  }, []);

  return { startTransition };
}

export function ThemeToggleButton({
  theme,
  onClick,
  variant = 'circle-blur',
  start = 'center',
  className = '',
}: ThemeToggleButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      // Check if View Transition API is available
      if (typeof document === 'undefined' || !document.startViewTransition || variant === 'gif') {
        onClick();
        return;
      }

      const x = e.clientX;
      const y = e.clientY;
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      let clipPath: string[] = [];

      if (variant === 'circle' || variant === 'circle-blur') {
        const startX = start === 'center' ? '50%' : start.includes('right') ? '100%' : '0%';
        const startY = start === 'center' ? '50%' : start.includes('top') ? '0%' : '100%';

        clipPath = [
          `circle(0px at ${startX} ${startY})`,
          `circle(${endRadius}px at ${startX} ${startY})`,
        ];
      } else if (variant === 'polygon') {
        clipPath = [
          'polygon(0 0, 0 0, 0 100%, 0 100%)',
          'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        ];
      }

      try {
        const transition = document.startViewTransition(() => {
          onClick();
        });

        transition.ready.then(() => {
          const filter = variant === 'circle-blur' ? 'blur(40px)' : 'none';

          document.documentElement.animate(
            {
              clipPath,
              filter: [filter, 'none'],
            },
            {
              duration: 500,
              easing: 'ease-in-out',
              pseudoElement: '::view-transition-new(root)',
            }
          );
        }).catch(() => {
          // Fallback if animation fails
          onClick();
        });
      } catch (error) {
        // Fallback if View Transition fails
        onClick();
      }
    },
    [onClick, variant, start]
  );

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className={`w-12 h-12 p-0 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 flex items-center justify-center transition-all group ${className}`}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
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
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      ) : (
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
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      )}
    </button>
  );
}

'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useTheme } from '@/contexts/theme-context';
import { ArrowDown } from 'lucide-react';

export const Conversation = ({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`relative flex flex-col ${className}`}>
      {children}
    </div>
  );
};

export const ConversationContent = ({ children }: { children: React.ReactNode }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [children]);

  return (
    <div className="flex-1 overflow-y-auto space-y-4 scrollbar-thin min-h-0">
      {children}
      <div ref={messagesEndRef} />
    </div>
  );
};

export const ConversationEmptyState = ({
  icon,
  title,
  description,
}: {
  icon?: React.ReactNode;
  title: string;
  description: string;
}) => {
  const { theme } = useTheme();

  return (
    <div className="flex flex-col items-center justify-center h-full py-12">
      {icon && (
        <div
          className="p-4 rounded-2xl mb-4"
          style={{
            background:
              theme === 'dark'
                ? 'rgba(204, 159, 83, 0.1)'
                : 'rgba(28, 53, 94, 0.1)',
          }}
        >
          <div style={{ color: theme === 'dark' ? '#CC9F53' : '#1C355E' }}>
            {icon}
          </div>
        </div>
      )}
      <h3
        className="text-lg font-semibold mb-2"
        style={{
          color: theme === 'dark' ? '#CC9F53' : '#1C355E',
        }}
      >
        {title}
      </h3>
      <p
        className="text-sm text-center max-w-md"
        style={{
          color: theme === 'dark' ? '#D6D1CA' : '#1C355E',
          opacity: 0.6,
        }}
      >
        {description}
      </p>
    </div>
  );
};

export const ConversationScrollButton = () => {
  const { theme } = useTheme();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      const isNearBottom =
        target.scrollHeight - target.scrollTop - target.clientHeight < 100;
      setShowButton(!isNearBottom && target.scrollTop > 100);
    };

    const scrollContainer = document.querySelector('.scrollbar-thin');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToBottom = () => {
    const scrollContainer = document.querySelector('.scrollbar-thin');
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  if (!showButton) return null;

  return (
    <button
      onClick={scrollToBottom}
      className="absolute bottom-4 right-4 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-10"
      style={{
        background:
          theme === 'dark'
            ? 'linear-gradient(135deg, #CC9F53, #B8893D)'
            : 'linear-gradient(135deg, #1C355E, #2A4A7C)',
        boxShadow: '0 4px 12px rgba(204, 159, 83, 0.3)',
      }}
    >
      <ArrowDown className="w-5 h-5 text-white" />
    </button>
  );
};

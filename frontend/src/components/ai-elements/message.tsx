'use client';

import React, { useState } from 'react';
import { useTheme } from '@/contexts/theme-context';
import { Copy, Check } from 'lucide-react';

interface MessageProps {
  from: 'user' | 'assistant';
  children: React.ReactNode;
  timestamp?: Date;
  avatar?: React.ReactNode;
  onCopy?: (content: string) => void;
}

export const Message = ({ from, children, timestamp, avatar }: MessageProps) => {
  const { theme } = useTheme();

  return (
    <div
      className={`flex gap-3 ${from === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      {from === 'assistant' && avatar ? (
        // Custom avatar without background
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
          {avatar}
        </div>
      ) : (
        // Default avatar with background for user
        <div
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background:
              theme === 'dark'
                ? 'rgba(28, 53, 94, 0.4)'
                : 'rgba(28, 53, 94, 0.3)',
          }}
        >
          <div
            className="w-5 h-5 rounded-full"
            style={{
              background: theme === 'dark' ? '#CC9F53' : '#1C355E',
            }}
          />
        </div>
      )}

      {/* Message Content */}
      <div
        className={`flex flex-col ${from === 'user' ? 'items-end' : 'items-start'} flex-1 max-w-[80%]`}
      >
        {children}

        {/* Timestamp */}
        {timestamp && (
          <p
            className="text-[10px] mt-1 px-2"
            style={{
              color: 'rgba(255, 255, 255, 0.5)',
              textAlign: from === 'user' ? 'right' : 'left',
            }}
          >
            {timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
    </div>
  );
};

interface MessageContentProps {
  children: React.ReactNode;
  from?: 'user' | 'assistant';
  showCopyButton?: boolean;
  messageId?: string;
}

export const MessageContent = ({
  children,
  from = 'assistant',
  showCopyButton = true,
  messageId,
}: MessageContentProps) => {
  const { theme } = useTheme();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(messageId || 'temp');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const textContent = typeof children === 'string' ? children : '';

  return (
    <div
      className="group relative px-4 py-3 rounded-2xl"
      style={{
        background:
          from === 'user'
            ? theme === 'dark'
              ? 'rgba(204, 159, 83, 0.2)'
              : 'rgba(28, 53, 94, 0.15)'
            : 'transparent',
        border: from === 'user'
          ? `1px solid ${theme === 'dark' ? 'rgba(204, 159, 83, 0.3)' : 'rgba(28, 53, 94, 0.2)'}`
          : 'none',
      }}
    >
      <div
        className="text-sm leading-relaxed"
        style={{
          color: '#FFFFFF',
        }}
      >
        {children}
      </div>

      {/* Copy Button */}
      {showCopyButton && from === 'assistant' && textContent && (
        <button
          onClick={() => copyToClipboard(textContent)}
          className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{
            background:
              theme === 'dark'
                ? 'rgba(28, 53, 94, 0.5)'
                : 'rgba(255, 255, 255, 0.8)',
          }}
        >
          {copiedId === (messageId || 'temp') ? (
            <Check className="w-3 h-3" style={{ color: '#22c55e' }} />
          ) : (
            <Copy
              className="w-3 h-3"
              style={{ color: theme === 'dark' ? '#CC9F53' : '#1C355E' }}
            />
          )}
        </button>
      )}
    </div>
  );
};

'use client';

import { useState, useRef } from 'react';
import { MetricCard } from '../metrics/metric-card';
import { useTheme } from '@/contexts/theme-context';
import { useLanguage } from '@/contexts/language-context';
import { LottieIcon } from '../metrics/lottie-icon';
import foridayLogo from '../../../../public/AI logo Foriday.json';
import { Maximize2, Minimize2 } from 'lucide-react';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputProvider,
  PromptInputTextarea,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTools,
  PromptInputButton,
  PromptInputAttachments,
  PromptInputAttachment,
  PromptInputActionAddAttachments,
  PromptInputSpeechButton,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input';
import {
  ModelSelector,
  ModelSelectorTrigger,
  ModelSelectorLogo,
  ModelSelectorName,
} from '@/components/ai-elements/model-selector';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const models = [
  {
    id: 'claude-sonnet-4-5',
    name: 'Claude Sonnet 4.5',
    provider: 'anthropic',
  },
  {
    id: 'claude-opus-4',
    name: 'Claude Opus 4',
    provider: 'anthropic',
  },
];

export function ChatAI() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [status, setStatus] = useState<'ready' | 'submitted' | 'streaming' | 'error'>('ready');
  const [model, setModel] = useState(models[0].id);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedModelData = models.find((m) => m.id === model);

  const handleSubmit = async (message: PromptInputMessage) => {
    if (!message.text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message.text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setStatus('submitted');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setStatus('streaming');
    }, 200);

    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: t('dashboard.metrics.chat.mockResponse'),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
      setStatus('ready');
    }, 2000);
  };

  // Render Chat Content
  const renderChatContent = () => (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12">
          <LottieIcon animationData={foridayLogo} className="w-full h-full" />
        </div>
        <div>
          <h2
            className="text-xl font-bold"
            style={{
              color: theme === 'dark' ? '#CC9F53' : '#FFFFFF',
            }}
          >
            {t('dashboard.metrics.chat.title')}
          </h2>
        </div>
      </div>

      {/* Messages Area */}
      <Conversation className="flex-1 mb-6 min-h-0">
        <ConversationContent>
          {messages.map((message) => (
            <Message
              key={message.id}
              from={message.role}
              timestamp={message.timestamp}
              avatar={
                message.role === 'assistant' ? (
                  <div className="w-10 h-10">
                    <LottieIcon animationData={foridayLogo} className="w-full h-full" />
                  </div>
                ) : undefined
              }
            >
              <MessageContent from={message.role} messageId={message.id}>
                {message.content}
              </MessageContent>
            </Message>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <Message
              from="assistant"
              avatar={
                <div className="w-10 h-10">
                  <LottieIcon animationData={foridayLogo} className="w-full h-full" />
                </div>
              }
            >
              <div className="px-4 py-3">
                <div className="flex gap-1">
                  <div
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{
                      background: theme === 'dark' ? '#CC9F53' : '#1C355E',
                      animationDelay: '0ms',
                    }}
                  />
                  <div
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{
                      background: theme === 'dark' ? '#CC9F53' : '#1C355E',
                      animationDelay: '150ms',
                    }}
                  />
                  <div
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{
                      background: theme === 'dark' ? '#CC9F53' : '#1C355E',
                      animationDelay: '300ms',
                    }}
                  />
                </div>
              </div>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Modern Input using PromptInput */}
      <PromptInputProvider>
        <PromptInput onSubmit={handleSubmit} multiple globalDrop>
          <PromptInputAttachments>
            {(attachment) => <PromptInputAttachment data={attachment} />}
          </PromptInputAttachments>
          <PromptInputBody>
            <PromptInputTextarea ref={textareaRef} placeholder={t('dashboard.metrics.chat.placeholder')} />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionAddAttachments />
              <PromptInputSpeechButton textareaRef={textareaRef} />
              <ModelSelector onOpenChange={setModelSelectorOpen} open={modelSelectorOpen}>
                <ModelSelectorTrigger asChild>
                  <PromptInputButton>
                    {selectedModelData?.provider && (
                      <ModelSelectorLogo provider={selectedModelData.provider} />
                    )}
                    {selectedModelData?.name && (
                      <ModelSelectorName>{selectedModelData.name}</ModelSelectorName>
                    )}
                  </PromptInputButton>
                </ModelSelectorTrigger>
              </ModelSelector>
            </PromptInputTools>
            <PromptInputSubmit status={status} />
          </PromptInputFooter>
        </PromptInput>
      </PromptInputProvider>
    </>
  );

  return (
    <>
      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-8"
          style={{
            background: 'rgba(0, 0, 0, 0.95)',
            animation: 'fadeIn 0.3s ease-in-out',
          }}
          onClick={() => setIsFullscreen(false)}
        >
          <div
            className="w-full h-full max-w-7xl"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <div className="relative w-full h-full">
              {/* Close Button */}
              <button
                onClick={() => setIsFullscreen(false)}
                className="absolute top-4 right-4 z-10 p-2.5 rounded-lg transition-all duration-300 hover:scale-110 hover:rotate-90"
                style={{
                  background:
                    theme === 'dark'
                      ? 'rgba(204, 159, 83, 0.15)'
                      : 'rgba(28, 53, 94, 0.15)',
                  border: `1px solid ${
                    theme === 'dark'
                      ? 'rgba(204, 159, 83, 0.3)'
                      : 'rgba(28, 53, 94, 0.3)'
                  }`,
                  boxShadow:
                    theme === 'dark'
                      ? '0 4px 16px rgba(204, 159, 83, 0.4)'
                      : '0 4px 16px rgba(28, 53, 94, 0.4)',
                }}
              >
                <Minimize2
                  className="w-5 h-5"
                  style={{ color: theme === 'dark' ? '#CC9F53' : '#FFFFFF' }}
                />
              </button>

              <MetricCard
                className="w-full h-full flex flex-col p-8 shadow-2xl"
                style={{
                  background: theme === 'dark'
                    ? '#1C355E'
                    : '#D6D1CA',
                }}
              >
                {renderChatContent()}
              </MetricCard>
            </div>
          </div>
        </div>
      )}

      {/* Normal View */}
      <div className="group relative h-full">
        {/* Maximize Button */}
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
          style={{
            background:
              theme === 'dark'
                ? 'rgba(204, 159, 83, 0.15)'
                : 'rgba(28, 53, 94, 0.15)',
            border: `1px solid ${
              theme === 'dark'
                ? 'rgba(204, 159, 83, 0.3)'
                : 'rgba(28, 53, 94, 0.3)'
            }`,
          }}
        >
          <Maximize2
            className="w-4 h-4"
            style={{ color: theme === 'dark' ? '#CC9F53' : '#FFFFFF' }}
          />
        </button>

        <MetricCard className="h-full flex flex-col p-6">
          {renderChatContent()}
        </MetricCard>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}

'use client';

import { useState, useRef } from 'react';
import { useTheme } from '@/contexts/theme-context';
import { useLanguage } from '@/contexts/language-context';
import { LottieIcon } from '@/components/dashboard/metrics/lottie-icon';
import foridayLogo from '../../../public/AI logo Foriday.json';
import {
  Paperclip,
  Link2,
  Image as ImageIcon,
  X,
  Upload
} from 'lucide-react';
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

type TabType = 'ai' | 'uploads' | 'links';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface RightSidebarProps {
  onAIPrompt?: (prompt: string) => void;
  onFileUpload?: (files: File[]) => void;
  onAddLink?: (url: string, title: string) => void;
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

// Quick actions for CR MEP report
const quickActions = [
  { label: 'Rédiger nouvelles fonctionnalités', prompt: 'Rédige une description professionnelle des nouvelles fonctionnalités de ce package', icon: '✨' },
  { label: 'Lister les améliorations', prompt: 'Liste les améliorations techniques apportées dans ce déploiement', icon: '🔧' },
  { label: 'Documenter corrections', prompt: 'Documente les corrections et bug fixes inclus dans cette version', icon: '🐛' },
  { label: 'Analyser les métriques', prompt: 'Analyse les métriques du sprint et identifie les tendances clés', icon: '📊' },
  { label: 'Générer résumé exécutif', prompt: 'Génère un résumé exécutif pour ce compte rendu de mise en production', icon: '📋' },
  { label: 'Suggérer recommandations', prompt: 'Suggère des recommandations pour les prochains déploiements', icon: '💡' },
];

export function ReportRightSidebar({
  onAIPrompt,
  onFileUpload,
  onAddLink
}: RightSidebarProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('ai');
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  // AI Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [status, setStatus] = useState<'ready' | 'submitted' | 'streaming' | 'error'>('ready');
  const [model, setModel] = useState(models[0].id);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedModelData = models.find((m) => m.id === model);

  const tabs = [
    { id: 'ai' as TabType, label: t('report.ai.title'), icon: null },
    { id: 'uploads' as TabType, label: t('report.files.title'), icon: Paperclip },
    { id: 'links' as TabType, label: t('report.links.title'), icon: Link2 },
  ];

  const handleAISubmit = async (message: PromptInputMessage) => {
    if (!message.text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message.text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setStatus('submitted');
    setIsTyping(true);

    // Call parent handler
    onAIPrompt?.(message.text);

    // Simulate AI response
    setTimeout(() => {
      setStatus('streaming');
    }, 200);

    setTimeout(() => {
      const aiMessage: ChatMessage = {
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

  const handleQuickAction = (prompt: string) => {
    // Create synthetic message object
    const syntheticMessage: PromptInputMessage = {
      text: prompt,
      attachments: [],
    };
    handleAISubmit(syntheticMessage);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tabs Header */}
      <div
        className="flex border-b"
        style={{ borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(28, 53, 94, 0.08)' }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-150"
              style={{
                color: isActive ? '#CC9F53' : 'rgba(255, 255, 255, 0.6)',
                borderBottom: isActive ? '2px solid #CC9F53' : '2px solid transparent',
              }}
            >
              {tab.id === 'ai' ? (
                <div style={{ width: '16px', height: '16px' }}>
                  <LottieIcon animationData={foridayLogo} width={16} height={16} />
                </div>
              ) : (
                Icon && <Icon className="w-4 h-4" />
              )}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* AI Chat Tab */}
        {activeTab === 'ai' && (
          <div className="flex-1 flex flex-col p-4">
            {/* Quick Actions */}
            <div className="mb-4">
              <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Actions rapides
              </p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.prompt)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
                    style={{
                      background: 'rgba(204, 159, 83, 0.15)',
                      color: '#CC9F53',
                      border: '1px solid rgba(204, 159, 83, 0.3)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(204, 159, 83, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(204, 159, 83, 0.15)';
                    }}
                  >
                    <span>{action.icon}</span>
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Messages Area */}
            <Conversation className="flex-1 mb-4 min-h-0">
              <ConversationContent>
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <div className="mx-auto mb-3" style={{ width: '48px', height: '48px' }}>
                      <LottieIcon animationData={foridayLogo} width={48} height={48} />
                    </div>
                    <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                      {t('report.ai.emptyState')}
                    </p>
                  </div>
                )}
                {messages.map((message) => (
                  <Message
                    key={message.id}
                    from={message.role}
                    timestamp={message.timestamp}
                    avatar={
                      message.role === 'assistant' ? (
                        <div className="w-8 h-8">
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
                      <div className="w-8 h-8">
                        <LottieIcon animationData={foridayLogo} className="w-full h-full" />
                      </div>
                    }
                  >
                    <div className="px-4 py-3">
                      <div className="flex gap-1">
                        <div
                          className="w-2 h-2 rounded-full animate-bounce"
                          style={{
                            background: '#CC9F53',
                            animationDelay: '0ms',
                          }}
                        />
                        <div
                          className="w-2 h-2 rounded-full animate-bounce"
                          style={{
                            background: '#CC9F53',
                            animationDelay: '150ms',
                          }}
                        />
                        <div
                          className="w-2 h-2 rounded-full animate-bounce"
                          style={{
                            background: '#CC9F53',
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
              <PromptInput onSubmit={handleAISubmit} multiple globalDrop>
                <PromptInputAttachments>
                  {(attachment) => <PromptInputAttachment data={attachment} />}
                </PromptInputAttachments>
                <PromptInputBody>
                  <PromptInputTextarea ref={textareaRef} placeholder={t('report.ai.placeholder')} />
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
          </div>
        )}

        {/* Uploads Tab */}
        {activeTab === 'uploads' && (
          <div className="flex-1 flex flex-col p-4">
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2" style={{ color: '#FFFFFF' }}>
                {t('report.files.title')}
              </h3>
              <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                {t('report.files.description')}
              </p>
            </div>

            {/* Upload Area */}
            <div
              className="border-2 border-dashed rounded-lg p-8 mb-4 cursor-pointer transition-all duration-150 hover:border-opacity-50"
              style={{
                borderColor: 'rgba(204, 159, 83, 0.3)',
                background: 'rgba(204, 159, 83, 0.05)',
              }}
            >
              <div className="text-center">
                <Upload className="w-8 h-8 mx-auto mb-3" style={{ color: '#CC9F53' }} />
                <p className="text-sm mb-1" style={{ color: '#FFFFFF' }}>
                  {t('report.files.dragDrop')}
                </p>
                <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  {t('report.files.dragDropDesc')}
                </p>
              </div>
            </div>

            {/* Uploaded Files List */}
            <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin">
              {uploadedFiles.length === 0 ? (
                <div className="text-center py-8">
                  <Paperclip className="w-6 h-6 mx-auto mb-2" style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
                  <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    {t('report.files.emptyState')}
                  </p>
                </div>
              ) : (
                uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <ImageIcon className="w-4 h-4" style={{ color: '#CC9F53' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate" style={{ color: '#FFFFFF' }}>
                        {file.name}
                      </p>
                      <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                        {file.size}
                      </p>
                    </div>
                    <button className="p-1 rounded transition-colors duration-150 hover:bg-red-500/20">
                      <X className="w-4 h-4" style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Links Tab */}
        {activeTab === 'links' && (
          <div className="flex-1 flex flex-col p-4">
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2" style={{ color: '#FFFFFF' }}>
                {t('report.links.title')}
              </h3>
              <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                {t('report.links.description')}
              </p>
            </div>

            {/* Add Link Button */}
            <button
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium mb-4 transition-all duration-150"
              style={{
                background: 'rgba(31, 102, 153, 0.15)',
                color: '#1F6699',
                border: '1px solid rgba(31, 102, 153, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(31, 102, 153, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(31, 102, 153, 0.15)';
              }}
            >
              <Link2 className="w-4 h-4" />
              <span>{t('report.links.addLink')}</span>
            </button>

            {/* Links List */}
            <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin">
              <div className="text-center py-8">
                <Link2 className="w-6 h-6 mx-auto mb-2" style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
                <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  {t('report.links.emptyState')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

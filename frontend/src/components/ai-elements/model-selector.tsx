'use client';

import React from 'react';
import { useTheme } from '@/contexts/theme-context';
import { Bot, Sparkles } from 'lucide-react';

export const ModelSelector = ({
  children,
  open,
  onOpenChange,
}: {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  return <div className="relative">{children}</div>;
};

export const ModelSelectorTrigger = React.forwardRef<
  HTMLDivElement,
  { children: React.ReactNode; asChild?: boolean }
>(({ children, asChild }, ref) => {
  return <div ref={ref}>{children}</div>;
});

ModelSelectorTrigger.displayName = 'ModelSelectorTrigger';

export const ModelSelectorLogo = ({ provider }: { provider: string }) => {
  const { theme } = useTheme();

  // Map provider logos
  const logoMap: Record<string, React.ReactNode> = {
    anthropic: <Sparkles className="w-4 h-4" style={{ color: theme === 'dark' ? '#CC9F53' : '#1C355E' }} />,
    openai: <Bot className="w-4 h-4" style={{ color: theme === 'dark' ? '#CC9F53' : '#1C355E' }} />,
    google: <Bot className="w-4 h-4" style={{ color: theme === 'dark' ? '#CC9F53' : '#1C355E' }} />,
  };

  return logoMap[provider] || null;
};

export const ModelSelectorName = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();

  return (
    <span className="text-xs font-medium" style={{ color: theme === 'dark' ? '#FFFFFF' : '#1C355E' }}>
      {children}
    </span>
  );
};

export const ModelSelectorContent = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

export const ModelSelectorInput = ({ placeholder }: { placeholder: string }) => {
  return <input placeholder={placeholder} className="hidden" />;
};

export const ModelSelectorList = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

export const ModelSelectorEmpty = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

export const ModelSelectorGroup = ({
  children,
  heading,
}: {
  children: React.ReactNode;
  heading: string;
}) => {
  return <div>{children}</div>;
};

export const ModelSelectorItem = ({
  children,
  value,
  onSelect,
}: {
  children: React.ReactNode;
  value: string;
  onSelect: () => void;
}) => {
  return <div onClick={onSelect}>{children}</div>;
};

export const ModelSelectorLogoGroup = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex items-center gap-1">{children}</div>;
};

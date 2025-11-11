'use client';

import React, { createContext, useContext, useRef, useState, useCallback, forwardRef } from 'react';
import { Send, Loader2, Paperclip, Mic, X } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';

export interface PromptInputMessage {
  text: string;
  files?: File[];
}

interface PromptInputContextValue {
  textInput: {
    input: string;
    setInput: (value: string) => void;
    clear: () => void;
  };
  attachments: {
    files: File[];
    add: (files: File[]) => void;
    remove: (index: number) => void;
    clear: () => void;
  };
}

const PromptInputContext = createContext<PromptInputContextValue | null>(null);

export const usePromptInputController = () => {
  const context = useContext(PromptInputContext);
  if (!context) throw new Error('usePromptInputController must be used within PromptInputProvider');
  return context;
};

export const PromptInputProvider = ({ children }: { children: React.ReactNode }) => {
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const value: PromptInputContextValue = {
    textInput: {
      input,
      setInput,
      clear: () => setInput(''),
    },
    attachments: {
      files,
      add: (newFiles) => setFiles((prev) => [...prev, ...newFiles]),
      remove: (index) => setFiles((prev) => prev.filter((_, i) => i !== index)),
      clear: () => setFiles([]),
    },
  };

  return <PromptInputContext.Provider value={value}>{children}</PromptInputContext.Provider>;
};

interface PromptInputProps {
  children: React.ReactNode;
  onSubmit: (message: PromptInputMessage) => void;
  multiple?: boolean;
  globalDrop?: boolean;
}

export const PromptInput = ({ children, onSubmit, multiple, globalDrop }: PromptInputProps) => {
  const controller = usePromptInputController();
  const { theme } = useTheme();

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const message: PromptInputMessage = {
        text: controller.textInput.input,
        files: controller.attachments.files,
      };
      onSubmit(message);
      controller.textInput.clear();
      controller.attachments.clear();
    },
    [controller, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div
        className="relative rounded-2xl p-1 transition-all duration-300"
        style={{
          background: theme === 'dark' ? 'rgba(28, 53, 94, 0.3)' : 'rgba(214, 209, 202, 0.25)',
          border: `1px solid ${theme === 'dark' ? 'rgba(204, 159, 83, 0.3)' : 'rgba(214, 209, 202, 0.4)'}`,
        }}
      >
        {children}
      </div>
    </form>
  );
};

export const PromptInputAttachments = ({
  children,
}: {
  children: (attachment: File) => React.ReactNode;
}) => {
  const controller = usePromptInputController();

  if (controller.attachments.files.length === 0) return null;

  return (
    <div className="flex gap-2 p-2 flex-wrap">
      {controller.attachments.files.map((file, index) => (
        <div key={index}>{children(file)}</div>
      ))}
    </div>
  );
};

export const PromptInputAttachment = ({ data }: { data: File }) => {
  const controller = usePromptInputController();
  const { theme } = useTheme();
  const index = controller.attachments.files.indexOf(data);

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
      style={{
        background: theme === 'dark' ? 'rgba(204, 159, 83, 0.15)' : 'rgba(28, 53, 94, 0.1)',
        border: `1px solid ${theme === 'dark' ? 'rgba(204, 159, 83, 0.3)' : 'rgba(28, 53, 94, 0.2)'}`,
      }}
    >
      <Paperclip className="w-3 h-3" style={{ color: theme === 'dark' ? '#CC9F53' : '#1C355E' }} />
      <span className="text-xs font-medium" style={{ color: '#FFFFFF' }}>
        {data.name}
      </span>
      <button
        type="button"
        onClick={() => controller.attachments.remove(index)}
        className="ml-2 hover:scale-110 transition-transform"
      >
        <X className="w-3 h-3" style={{ color: theme === 'dark' ? '#CC9F53' : '#1C355E' }} />
      </button>
    </div>
  );
};

export const PromptInputBody = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex items-center gap-2 p-2">{children}</div>;
};

interface PromptInputTextareaProps {
  placeholder?: string;
}

export const PromptInputTextarea = forwardRef<HTMLTextAreaElement, PromptInputTextareaProps>(
  ({ placeholder }, ref) => {
    const controller = usePromptInputController();
    const { theme } = useTheme();

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        form?.requestSubmit();
      }
    };

    return (
      <textarea
        ref={ref}
        value={controller.textInput.input}
        onChange={(e) => controller.textInput.setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        className="flex-1 bg-transparent resize-none outline-none text-sm px-2 py-2 max-h-32"
        style={{
          color: '#FFFFFF',
        }}
      />
    );
  }
);

PromptInputTextarea.displayName = 'PromptInputTextarea';

export const PromptInputFooter = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex items-center justify-between gap-2 p-2 pt-0">{children}</div>;
};

export const PromptInputTools = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex items-center gap-2">{children}</div>;
};

export const PromptInputButton = ({
  children,
  onClick,
  type = 'button',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
}) => {
  const { theme } = useTheme();

  return (
    <button
      type={type}
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-105"
      style={{
        background: theme === 'dark' ? 'rgba(28, 53, 94, 0.3)' : 'rgba(214, 209, 202, 0.25)',
        border: `1px solid ${theme === 'dark' ? 'rgba(204, 159, 83, 0.2)' : 'rgba(214, 209, 202, 0.35)'}`,
        color: theme === 'dark' ? '#CC9F53' : '#FFFFFF',
      }}
    >
      {children}
    </button>
  );
};

export const PromptInputSubmit = ({
  status,
}: {
  status?: 'ready' | 'submitted' | 'streaming' | 'error';
}) => {
  const controller = usePromptInputController();
  const { theme } = useTheme();
  const isDisabled = status === 'submitted' || status === 'streaming' || !controller.textInput.input.trim();

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className="flex-shrink-0 p-3 rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
      style={{
        background:
          theme === 'dark'
            ? 'linear-gradient(135deg, #CC9F53, #B8893D)'
            : 'linear-gradient(135deg, #1C355E, #2A4A7C)',
        boxShadow: '0 4px 12px rgba(204, 159, 83, 0.3)',
      }}
    >
      {status === 'streaming' || status === 'submitted' ? (
        <Loader2 className="w-5 h-5 text-white animate-spin" />
      ) : (
        <Send className="w-5 h-5 text-white" />
      )}
    </button>
  );
};

export const PromptInputActionAddAttachments = () => {
  const controller = usePromptInputController();
  const { theme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    controller.attachments.add(files);
    e.target.value = '';
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
        accept="image/*,.pdf,.doc,.docx,.txt"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
        style={{
          background: theme === 'dark' ? 'rgba(28, 53, 94, 0.3)' : 'rgba(214, 209, 202, 0.3)',
          border: `1px solid ${theme === 'dark' ? 'rgba(204, 159, 83, 0.2)' : 'rgba(214, 209, 202, 0.4)'}`,
        }}
      >
        <Paperclip className="w-4 h-4" style={{ color: theme === 'dark' ? '#CC9F53' : '#1C355E' }} />
      </button>
    </>
  );
};

export const PromptInputSpeechButton = ({
  textareaRef,
}: {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}) => {
  const { theme } = useTheme();
  const [isRecording, setIsRecording] = useState(false);

  const handleClick = () => {
    setIsRecording(!isRecording);
    // Speech recognition logic would go here
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`p-2 rounded-lg transition-all duration-200 ${isRecording ? 'animate-pulse' : ''}`}
      style={{
        background: isRecording
          ? 'rgba(239, 68, 68, 0.2)'
          : theme === 'dark'
          ? 'rgba(28, 53, 94, 0.3)'
          : 'rgba(214, 209, 202, 0.25)',
        border: `1px solid ${
          isRecording
            ? 'rgba(239, 68, 68, 0.4)'
            : theme === 'dark'
            ? 'rgba(204, 159, 83, 0.2)'
            : 'rgba(214, 209, 202, 0.35)'
        }`,
      }}
    >
      <Mic
        className="w-4 h-4"
        style={{ color: isRecording ? '#ef4444' : theme === 'dark' ? '#CC9F53' : '#1C355E' }}
      />
    </button>
  );
};

// Menu components (simplified versions)
export const PromptInputActionMenu = ({ children }: { children: React.ReactNode }) => {
  return <div className="relative">{children}</div>;
};

export const PromptInputActionMenuTrigger = () => {
  const { theme } = useTheme();

  return (
    <button
      type="button"
      className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
      style={{
        background: theme === 'dark' ? 'rgba(28, 53, 94, 0.3)' : 'rgba(214, 209, 202, 0.25)',
        border: `1px solid ${theme === 'dark' ? 'rgba(204, 159, 83, 0.2)' : 'rgba(214, 209, 202, 0.35)'}`,
      }}
    >
      <Paperclip className="w-4 h-4" style={{ color: theme === 'dark' ? '#CC9F53' : '#1C355E' }} />
    </button>
  );
};

export const PromptInputActionMenuContent = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { createLowlight } from 'lowlight';
import typescript from 'highlight.js/lib/languages/typescript';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import { useTheme } from '@/contexts/theme-context';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Image as ImageIcon,
  Table as TableIcon,
  Code2,
  CheckSquare,
} from 'lucide-react';

// Configure lowlight with languages
const lowlight = createLowlight();
lowlight.register('typescript', typescript);
lowlight.register('javascript', javascript);
lowlight.register('python', python);

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
}

export function TiptapEditor({ content, onChange, placeholder, editable = true }: TiptapEditorProps) {
  const { theme } = useTheme();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: false, // We'll use CodeBlockLowlight instead
      }),
      Link.extend({ name: 'customLink' }).configure({
        openOnClick: false,
        HTMLAttributes: {
          style: 'color: #CC9F53; text-decoration: underline;',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline.extend({ name: 'customUnderline' }),
      Placeholder.configure({
        placeholder: placeholder || 'Start typing...',
      }),
      TextStyle,
      Color,
      Image.configure({
        HTMLAttributes: {
          style: 'max-width: 100%; height: auto; border-radius: 8px;',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          style: 'border-collapse: collapse; width: 100%; margin: 1rem 0;',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          style: 'border: 1px solid rgba(255, 255, 255, 0.2); padding: 0.5rem; background: rgba(204, 159, 83, 0.1);',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          style: 'border: 1px solid rgba(255, 255, 255, 0.2); padding: 0.5rem;',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          style: 'background: rgba(0, 0, 0, 0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; overflow-x: auto;',
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          style: 'list-style: none; padding-left: 0;',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          style: 'display: flex; align-items: start; gap: 0.5rem;',
        },
      }),
    ],
    content,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[200px] p-4',
        style: `color: rgba(255, 255, 255, 0.9); font-size: 15px; line-height: 1.6;`,
      },
    },
  });

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({
    onClick,
    isActive,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      onClick={onClick}
      title={title}
      className="p-2 rounded transition-all duration-150"
      style={{
        background: isActive ? '#CC9F53' : 'rgba(255, 255, 255, 0.05)',
        color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)',
        border: `1px solid ${isActive ? '#CC9F53' : 'rgba(255, 255, 255, 0.1)'}`,
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
        }
      }}
    >
      {children}
    </button>
  );

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const addCodeBlock = () => {
    editor.chain().focus().toggleCodeBlock().run();
  };

  const addTaskList = () => {
    editor.chain().focus().toggleTaskList().run();
  };

  return (
    <div className="w-full">
      {/* Toolbar */}
      {editable && (
        <div
          className="flex flex-wrap items-center gap-1 p-2 mb-2 rounded-lg border-b"
          style={{
            background: 'rgba(0, 0, 0, 0.2)',
            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(28, 53, 94, 0.08)',
          }}
        >
          {/* Text Formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </ToolbarButton>

          <div
            className="w-px h-6 mx-1"
            style={{ background: 'rgba(255, 255, 255, 0.1)' }}
          />

          {/* Headings */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>

          <div
            className="w-px h-6 mx-1"
            style={{ background: 'rgba(255, 255, 255, 0.1)' }}
          />

          {/* Lists */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>

          <div
            className="w-px h-6 mx-1"
            style={{ background: 'rgba(255, 255, 255, 0.1)' }}
          />

          {/* Alignment */}
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </ToolbarButton>

          <div
            className="w-px h-6 mx-1"
            style={{ background: 'rgba(255, 255, 255, 0.1)' }}
          />

          {/* Link */}
          <ToolbarButton
            onClick={addLink}
            isActive={editor.isActive('link')}
            title="Add Link"
          >
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>

          <div
            className="w-px h-6 mx-1"
            style={{ background: 'rgba(255, 255, 255, 0.1)' }}
          />

          {/* Undo/Redo */}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            isActive={false}
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            isActive={false}
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </ToolbarButton>

          <div
            className="w-px h-6 mx-1"
            style={{ background: 'rgba(255, 255, 255, 0.1)' }}
          />

          {/* Advanced Features */}
          <ToolbarButton
            onClick={addImage}
            isActive={false}
            title="Add Image"
          >
            <ImageIcon className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={addTable}
            isActive={editor.isActive('table')}
            title="Insert Table"
          >
            <TableIcon className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={addCodeBlock}
            isActive={editor.isActive('codeBlock')}
            title="Code Block"
          >
            <Code2 className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={addTaskList}
            isActive={editor.isActive('taskList')}
            title="Task List"
          >
            <CheckSquare className="w-4 h-4" />
          </ToolbarButton>
        </div>
      )}

      {/* Editor Content */}
      <div
        className="rounded-lg min-h-[200px]"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(28, 53, 94, 0.1)'}`,
        }}
      >
        <EditorContent editor={editor} />
      </div>

      <style jsx global>{`
        .ProseMirror {
          min-height: 200px;
          padding: 1rem;
        }

        .ProseMirror:focus {
          outline: none;
        }

        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: rgba(255, 255, 255, 0.3);
          pointer-events: none;
          height: 0;
        }

        .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
          color: #1F6699;
          margin-top: 1em;
          margin-bottom: 0.5em;
        }

        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          color: #CC9F53;
          margin-top: 0.8em;
          margin-bottom: 0.4em;
        }

        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5em;
          margin: 0.5em 0;
        }

        .ProseMirror li {
          margin: 0.25em 0;
        }

        .ProseMirror a {
          color: #CC9F53;
          text-decoration: underline;
        }

        .ProseMirror a:hover {
          color: #d4ad68;
        }

        .ProseMirror strong {
          font-weight: 600;
        }

        .ProseMirror em {
          font-style: italic;
        }

        .ProseMirror u {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}

'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import React from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Écrivez votre contenu ici...',
  minHeight = '150px',
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline.extend({ name: 'customUnderline2' }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.extend({ name: 'customLink2' }).configure({
        openOnClick: false,
      }),
      Image,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      TextStyle,
      Color,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none',
        style: `min-height: ${minHeight}; padding: 12px; color: white;`,
      },
    },
  });

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({
    onClick,
    active = false,
    disabled = false,
    children,
    title,
  }: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded transition-colors ${
        active
          ? 'bg-amber-600 text-white'
          : 'hover:bg-white/10 text-white/70 hover:text-white'
      } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );

  const ColorButton = ({ color, label }: { color: string; label: string }) => (
    <button
      type="button"
      onClick={() => editor.chain().focus().setColor(color).run()}
      className="w-6 h-6 rounded border border-white/20 hover:border-white/40 transition-colors"
      style={{ backgroundColor: color }}
      title={label}
    />
  );

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Toolbar */}
      <div
        className="flex flex-wrap gap-1 p-2 border-b"
        style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
      >
        {/* Text Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Gras (Ctrl+B)"
        >
          <span className="font-bold text-sm">B</span>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italique (Ctrl+I)"
        >
          <span className="italic text-sm">I</span>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Souligné (Ctrl+U)"
        >
          <span className="underline text-sm">U</span>
        </ToolbarButton>

        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Titre 1"
        >
          <span className="text-sm font-semibold">H1</span>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Titre 2"
        >
          <span className="text-sm font-semibold">H2</span>
        </ToolbarButton>

        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Liste à puces"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Liste numérotée"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4h18M3 8h18M3 12h18M3 16h18M3 20h18"
            />
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          active={editor.isActive('taskList')}
          title="Liste de tâches"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
        </ToolbarButton>

        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title="Aligner à gauche"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h10M4 18h16"
            />
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title="Centrer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M7 12h10M4 18h16"
            />
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          title="Aligner à droite"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M10 12h10M4 18h16"
            />
          </svg>
        </ToolbarButton>

        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Link */}
        <ToolbarButton
          onClick={() => {
            const url = window.prompt('URL:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          active={editor.isActive('link')}
          title="Insérer un lien"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        </ToolbarButton>

        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Annuler (Ctrl+Z)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
            />
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Rétablir (Ctrl+Y)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6"
            />
          </svg>
        </ToolbarButton>

        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Table */}
        <ToolbarButton
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
          title="Insérer un tableau"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="Code"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
        </ToolbarButton>

        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Colors */}
        <div className="flex items-center gap-1 px-2">
          <span className="text-xs text-white/50 mr-1">Couleur:</span>
          <ColorButton color="#FFFFFF" label="Blanc" />
          <ColorButton color="#C9A961" label="Doré" />
          <ColorButton color="#FF6B6B" label="Rouge" />
          <ColorButton color="#4ECDC4" label="Turquoise" />
          <ColorButton color="#95E1D3" label="Vert" />
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="rich-text-editor"
        placeholder={placeholder}
      />

      <style jsx global>{`
        .rich-text-editor .ProseMirror {
          min-height: ${minHeight};
          padding: 12px;
          color: white;
        }

        .rich-text-editor .ProseMirror:focus {
          outline: none;
        }

        .rich-text-editor .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: rgba(255, 255, 255, 0.3);
          pointer-events: none;
          height: 0;
        }

        .rich-text-editor .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.5em 0;
        }

        .rich-text-editor .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.5em 0;
        }

        .rich-text-editor .ProseMirror h3 {
          font-size: 1.2em;
          font-weight: bold;
          margin: 0.5em 0;
        }

        .rich-text-editor .ProseMirror ul,
        .rich-text-editor .ProseMirror ol {
          padding-left: 1.5em;
          margin: 0.5em 0;
        }

        .rich-text-editor .ProseMirror li {
          margin: 0.25em 0;
        }

        .rich-text-editor .ProseMirror ul[data-type='taskList'] {
          list-style: none;
          padding-left: 0;
        }

        .rich-text-editor .ProseMirror ul[data-type='taskList'] li {
          display: flex;
          align-items: center;
        }

        .rich-text-editor .ProseMirror ul[data-type='taskList'] li label {
          margin-right: 0.5em;
        }

        .rich-text-editor .ProseMirror table {
          border-collapse: collapse;
          margin: 1em 0;
          overflow: hidden;
          table-layout: fixed;
          width: 100%;
        }

        .rich-text-editor .ProseMirror table td,
        .rich-text-editor .ProseMirror table th {
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 8px;
          position: relative;
          vertical-align: top;
        }

        .rich-text-editor .ProseMirror table th {
          background-color: rgba(255, 255, 255, 0.1);
          font-weight: bold;
          text-align: left;
        }

        .rich-text-editor .ProseMirror code {
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          padding: 2px 6px;
          font-family: 'Courier New', monospace;
        }

        .rich-text-editor .ProseMirror a {
          color: #4ECDC4;
          text-decoration: underline;
        }

        .rich-text-editor .ProseMirror strong {
          font-weight: bold;
        }

        .rich-text-editor .ProseMirror em {
          font-style: italic;
        }

        .rich-text-editor .ProseMirror u {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}

import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';

// ----------------------------------------------------------------------

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ onClick, active, disabled, title, children }) => (
  <button
    type="button"
    title={title}
    disabled={disabled}
    onClick={onClick}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 30,
      height: 30,
      borderRadius: 4,
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      background: active ? '#1976d2' : 'transparent',
      color: active ? '#fff' : '#374151',
      fontSize: 13,
      fontWeight: 600,
      opacity: disabled ? 0.4 : 1,
      transition: 'background 0.15s, color 0.15s',
    }}
    onMouseEnter={(e) => {
      if (!active && !disabled) (e.currentTarget as HTMLButtonElement).style.background = '#f3f4f6';
    }}
    onMouseLeave={(e) => {
      if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
    }}
  >
    {children}
  </button>
);

const Divider = () => (
  <span style={{ width: 1, height: 20, background: '#e5e7eb', margin: '0 4px', display: 'inline-block', flexShrink: 0 }} />
);

// SVG icons (inline, no extra dependency)
const Icons = {
  Bold: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>,
  Italic: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>,
  Underline: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>,
  Strike: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4H9a3 3 0 0 0-2.83 4"/><path d="M14 12a4 4 0 0 1 0 8H6"/><line x1="4" y1="12" x2="20" y2="12"/></svg>,
  H1: () => <span style={{ fontSize: 11, fontWeight: 700 }}>H1</span>,
  H2: () => <span style={{ fontSize: 11, fontWeight: 700 }}>H2</span>,
  H3: () => <span style={{ fontSize: 11, fontWeight: 700 }}>H3</span>,
  P: () => <span style={{ fontSize: 11, fontWeight: 700 }}>¶</span>,
  AlignLeft: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/></svg>,
  AlignCenter: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="12" x2="7" y2="12"/><line x1="19" y1="18" x2="5" y2="18"/></svg>,
  AlignRight: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="7" y2="18"/></svg>,
  AlignJustify: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="3" y2="12"/><line x1="21" y1="18" x2="3" y2="18"/></svg>,
  BulletList: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>,
  OrderedList: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><text x="2" y="8" fontSize="8" fill="currentColor" stroke="none">1.</text><text x="2" y="14" fontSize="8" fill="currentColor" stroke="none">2.</text><text x="2" y="20" fontSize="8" fill="currentColor" stroke="none">3.</text></svg>,
  Quote: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>,
  Code: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  HRule: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/></svg>,
  Link: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  Unlink: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/><line x1="4" y1="4" x2="20" y2="20"/></svg>,
  Image: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  Undo: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/></svg>,
  Redo: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"/></svg>,
};

// ----------------------------------------------------------------------

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: number;
  label?: string;
  error?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Tulis konten artikel di sini...',
  disabled = false,
  minHeight = 320,
  label,
  error = false,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        blockquote: { HTMLAttributes: { class: 'rte-blockquote' } },
        code: { HTMLAttributes: { class: 'rte-code' } },
        codeBlock: { HTMLAttributes: { class: 'rte-code-block' } },
        heading: { levels: [1, 2, 3] },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'rte-link', rel: 'noopener noreferrer' },
      }),
      Image.configure({ HTMLAttributes: { class: 'rte-image' } }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync value when parent resets the form
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href as string || '';
    const url = window.prompt('URL link:', prev);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('URL gambar:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div
      style={{
        border: error ? '1px solid #d32f2f' : '1px solid rgba(0,0,0,0.23)',
        borderRadius: 8,
        overflow: 'hidden',
        opacity: disabled ? 0.6 : 1,
        transition: 'border-color 0.2s',
      }}
      onFocus={(e) => {
        if (!disabled) (e.currentTarget as HTMLDivElement).style.borderColor = '#1976d2';
      }}
      onBlur={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = error ? '#d32f2f' : 'rgba(0,0,0,0.23)';
      }}
    >
      {/* Label */}
      {label && (
        <div style={{ padding: '6px 12px 0', fontSize: 12, color: error ? '#d32f2f' : 'rgba(0,0,0,0.6)', fontFamily: 'inherit' }}>
          {label}
        </div>
      )}

      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2,
          padding: '6px 8px',
          borderBottom: '1px solid #e5e7eb',
          background: '#f9fafb',
          userSelect: 'none',
        }}
      >
        {/* Undo / Redo */}
        <ToolbarButton title="Undo (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Icons.Undo />
        </ToolbarButton>
        <ToolbarButton title="Redo (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Icons.Redo />
        </ToolbarButton>

        <Divider />

        {/* Heading */}
        <ToolbarButton title="Heading 1" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Icons.H1 />
        </ToolbarButton>
        <ToolbarButton title="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Icons.H2 />
        </ToolbarButton>
        <ToolbarButton title="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Icons.H3 />
        </ToolbarButton>
        <ToolbarButton title="Paragraph" active={editor.isActive('paragraph')} onClick={() => editor.chain().focus().setParagraph().run()}>
          <Icons.P />
        </ToolbarButton>

        <Divider />

        {/* Text format */}
        <ToolbarButton title="Bold (Ctrl+B)" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Icons.Bold />
        </ToolbarButton>
        <ToolbarButton title="Italic (Ctrl+I)" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Icons.Italic />
        </ToolbarButton>
        <ToolbarButton title="Underline (Ctrl+U)" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <Icons.Underline />
        </ToolbarButton>
        <ToolbarButton title="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Icons.Strike />
        </ToolbarButton>

        <Divider />

        {/* Alignment */}
        <ToolbarButton title="Rata Kiri" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
          <Icons.AlignLeft />
        </ToolbarButton>
        <ToolbarButton title="Rata Tengah" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
          <Icons.AlignCenter />
        </ToolbarButton>
        <ToolbarButton title="Rata Kanan" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
          <Icons.AlignRight />
        </ToolbarButton>
        <ToolbarButton title="Rata Kanan-Kiri" active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()}>
          <Icons.AlignJustify />
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton title="Bullet List" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <Icons.BulletList />
        </ToolbarButton>
        <ToolbarButton title="Ordered List" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <Icons.OrderedList />
        </ToolbarButton>

        <Divider />

        {/* Blocks */}
        <ToolbarButton title="Blockquote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Icons.Quote />
        </ToolbarButton>
        <ToolbarButton title="Code Block" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <Icons.Code />
        </ToolbarButton>
        <ToolbarButton title="Garis Pemisah" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Icons.HRule />
        </ToolbarButton>

        <Divider />

        {/* Link & Image */}
        <ToolbarButton title="Insert Link" active={editor.isActive('link')} onClick={setLink}>
          <Icons.Link />
        </ToolbarButton>
        {editor.isActive('link') && (
          <ToolbarButton title="Remove Link" onClick={() => editor.chain().focus().unsetLink().run()}>
            <Icons.Unlink />
          </ToolbarButton>
        )}
        <ToolbarButton title="Insert Image (URL)" onClick={addImage}>
          <Icons.Image />
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <EditorContent
        editor={editor}
        style={{ minHeight }}
      />

      {/* Scoped CSS */}
      <style>{`
        .ProseMirror {
          padding: 12px 16px;
          min-height: ${minHeight}px;
          outline: none;
          font-family: inherit;
          font-size: 15px;
          line-height: 1.75;
          color: #111827;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          float: left;
          height: 0;
        }
        .ProseMirror h1 { font-size: 2em; font-weight: 700; margin: 0.75em 0 0.5em; line-height: 1.2; }
        .ProseMirror h2 { font-size: 1.5em; font-weight: 700; margin: 0.75em 0 0.5em; line-height: 1.3; }
        .ProseMirror h3 { font-size: 1.25em; font-weight: 600; margin: 0.75em 0 0.5em; line-height: 1.4; }
        .ProseMirror p { margin: 0.5em 0; }
        .ProseMirror ul { list-style: disc; padding-left: 1.5em; margin: 0.5em 0; }
        .ProseMirror ol { list-style: decimal; padding-left: 1.5em; margin: 0.5em 0; }
        .ProseMirror li { margin: 0.25em 0; }
        .ProseMirror strong { font-weight: 700; }
        .ProseMirror em { font-style: italic; }
        .ProseMirror u { text-decoration: underline; }
        .ProseMirror s { text-decoration: line-through; }
        .ProseMirror a.rte-link { color: #1976d2; text-decoration: underline; cursor: pointer; }
        .ProseMirror blockquote.rte-blockquote {
          border-left: 4px solid #e5e7eb;
          margin: 1em 0;
          padding: 0.5em 1em;
          color: #6b7280;
          font-style: italic;
        }
        .ProseMirror code.rte-code {
          background: #f3f4f6;
          border-radius: 3px;
          padding: 0.1em 0.4em;
          font-size: 0.9em;
          font-family: 'Fira Code', monospace;
        }
        .ProseMirror pre.rte-code-block {
          background: #1f2937;
          color: #e5e7eb;
          border-radius: 6px;
          padding: 1em;
          overflow-x: auto;
          font-family: 'Fira Code', monospace;
          font-size: 0.9em;
          margin: 1em 0;
        }
        .ProseMirror hr { border: none; border-top: 2px solid #e5e7eb; margin: 1.5em 0; }
        .ProseMirror img.rte-image { max-width: 100%; height: auto; border-radius: 6px; margin: 0.5em 0; }
      `}</style>
    </div>
  );
};

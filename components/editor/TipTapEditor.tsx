'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Youtube from '@tiptap/extension-youtube';
import FontFamily from '@tiptap/extension-font-family';
import { useCallback, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Youtube as YoutubeIcon,
  Minus,
  RemoveFormatting,
  Type
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface TipTapEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  height?: number;
  disabled?: boolean;
}

export function TipTapEditor({
  value,
  onChange,
  placeholder = 'Start writing your blog post...',
  height = 600,
  disabled = false,
}: TipTapEditorProps) {
  const editorInstance = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-slate-300',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder,
      }),
      Color,
      TextStyle,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Youtube.configure({
        controls: false,
      }),
      FontFamily,
    ],
    content: value || '',
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none min-h-[400px] p-6',
      },
    },
    immediatelyRender: false,
  });


  const setLink = useCallback(() => {
    if (!editorInstance) return;
    const previousUrl = editorInstance.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editorInstance.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editorInstance.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editorInstance]);

  const addImage = useCallback(() => {
    if (!editorInstance) return;
    const url = window.prompt('Image URL');

    if (url) {
      editorInstance.chain().focus().setImage({ src: url }).run();
    }
  }, [editorInstance]);

  const insertTable = useCallback(() => {
    if (!editorInstance) return;
    editorInstance.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editorInstance]);

  const addYoutube = useCallback(() => {
    if (!editorInstance) return;
    const url = window.prompt('Enter YouTube URL');

    if (url) {
      editorInstance.commands.setYoutubeVideo({
        src: url,
        width: 640,
        height: 480,
      });
    }
  }, [editorInstance]);

  const setFontFamily = useCallback((font: string) => {
    if (!editorInstance) return;
    if (font === 'Inter') {
      editorInstance.chain().focus().unsetFontFamily().run();
    } else {
      editorInstance.chain().focus().setFontFamily(font).run();
    }
  }, [editorInstance]);

  useEffect(() => {
    if (editorInstance && value !== editorInstance.getHTML()) {
      editorInstance.commands.setContent(value || '');
    }
  }, [value, editorInstance]);

  if (!editorInstance) {
    return null;
  }

  const editor = editorInstance;

  return (
    <div className={`border border-slate-300 rounded-lg overflow-hidden bg-white ${disabled ? 'border-transparent bg-transparent' : ''}`}>
      {/* Toolbar */}
      {!disabled && (
        <div className="border-b border-slate-200 bg-slate-50 p-2 flex flex-wrap gap-1 sticky top-0 z-10">
          {/* History */}
          <div className="flex gap-1 border-r border-slate-300 pr-2 mr-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().chain().focus().undo().run()}
              className="h-8 w-8 p-0"
              title="Undo"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().chain().focus().redo().run()}
              className="h-8 w-8 p-0"
              title="Redo"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>

          {/* Typography */}
          <div className="flex gap-1 border-r border-slate-300 pr-2 mr-2">
            <select
              className="h-8 text-xs bg-transparent border border-slate-200 rounded px-2 w-24 outline-none focus:border-slate-400"
              onChange={(e) => setFontFamily(e.target.value)}
              value={editor.getAttributes('textStyle').fontFamily || 'Inter'}
            >
              <option value="Inter">Default</option>
              <option value="Serif">Serif</option>
              <option value="Monospace">Monospace</option>
              <option value="Comic Sans MS">Comic Sans</option>
            </select>

            <Button
              type="button"
              size="sm"
              variant={editor.isActive('bold') ? 'default' : 'ghost'}
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={!editor.can().chain().focus().toggleBold().run()}
              className="h-8 w-8 p-0"
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant={editor.isActive('italic') ? 'default' : 'ghost'}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={!editor.can().chain().focus().toggleItalic().run()}
              className="h-8 w-8 p-0"
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant={editor.isActive('underline') ? 'default' : 'ghost'}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              disabled={!editor.can().chain().focus().toggleUnderline().run()}
              className="h-8 w-8 p-0"
              title="Underline"
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant={editor.isActive('strike') ? 'default' : 'ghost'}
              onClick={() => editor.chain().focus().toggleStrike().run()}
              disabled={!editor.can().chain().focus().toggleStrike().run()}
              className="h-8 w-8 p-0"
              title="Strikethrough"
            >
              <Strikethrough className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant={editor.isActive('subscript') ? 'default' : 'ghost'}
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              className="h-8 w-8 p-0"
              title="Subscript"
            >
              <SubscriptIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant={editor.isActive('superscript') ? 'default' : 'ghost'}
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              className="h-8 w-8 p-0"
              title="Superscript"
            >
              <SuperscriptIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant={editor.isActive('highlight') ? 'default' : 'ghost'}
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              className="h-8 w-8 p-0"
              title="Highlight"
            >
              <Highlighter className="h-4 w-4 text-yellow-500" />
            </Button>
            <div className="flex items-center justify-center w-8 h-8 rounded hover:bg-slate-200 cursor-pointer relative group">
              <span className="font-bold text-xs" style={{ color: editor.getAttributes('textStyle').color || '#000' }}>A</span>
              <input
                type="color"
                onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
                value={editor.getAttributes('textStyle').color || '#000000'}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                title="Text Color"
              />
            </div>
            <Button
              type="button"
              size="sm"
              variant={editor.isActive('code') ? 'default' : 'ghost'}
              onClick={() => editor.chain().focus().toggleCode().run()}
              className="h-8 w-8 p-0"
              title="Inline Code"
            >
              <Code className="h-4 w-4" />
            </Button>
          </div>

          {/* Headings */}
          <div className="flex gap-1 border-r border-slate-300 pr-2 mr-2">
            <Button
              type="button"
              size="sm"
              variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className="h-8 w-8 p-0"
              title="Heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className="h-8 w-8 p-0"
              title="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className="h-8 w-8 p-0"
              title="Heading 3"
            >
              <Heading3 className="h-4 w-4" />
            </Button>
          </div>

          {/* Lists */}
          <div className="flex gap-1 border-r border-slate-300 pr-2 mr-2">
            <Button
              type="button"
              size="sm"
              variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className="h-8 w-8 p-0"
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className="h-8 w-8 p-0"
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant={editor.isActive('taskList') ? 'default' : 'ghost'}
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              className="h-8 w-8 p-0"
              title="Task List"
            >
              <ListTodo className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className="h-8 w-8 p-0"
              title="Quote"
            >
              <Quote className="h-4 w-4" />
            </Button>
          </div>

          {/* Alignment */}
          <div className="flex gap-1 border-r border-slate-300 pr-2 mr-2">
            <Button
              type="button"
              size="sm"
              variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className="h-8 w-8 p-0"
              title="Align Left"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className="h-8 w-8 p-0"
              title="Align Center"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className="h-8 w-8 p-0"
              title="Align Right"
            >
              <AlignRight className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant={editor.isActive({ textAlign: 'justify' }) ? 'default' : 'ghost'}
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              className="h-8 w-8 p-0"
              title="Justify"
            >
              <AlignJustify className="h-4 w-4" />
            </Button>
          </div>

          {/* Media & Insert */}
          <div className="flex gap-1 border-r border-slate-300 pr-2 mr-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={setLink}
              className="h-8 w-8 p-0"
              title="Insert Link"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={addImage}
              className="h-8 w-8 p-0"
              title="Insert Image"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={addYoutube}
              className="h-8 w-8 p-0"
              title="Insert Video"
            >
              <YoutubeIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={insertTable}
              className="h-8 w-8 p-0"
              title="Insert Table"
            >
              <TableIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant={editor.isActive('codeBlock') ? 'default' : 'ghost'}
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className="h-8 w-8 p-0"
              title="Code Block"
            >
              <Code2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="h-8 w-8 p-0"
              title="Horizontal Rule"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-1">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
              className="h-8 w-8 p-0"
              title="Clear Formatting"
            >
              <RemoveFormatting className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div style={{ minHeight: disabled ? '0' : `${height}px` }} className="overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        .ProseMirror {
          outline: none;
          padding: 1.5rem;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #94a3b8;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
        .ProseMirror table {
          margin: 1rem 0;
          width: 100%;
        }
        .ProseMirror table td,
        .ProseMirror table th {
          padding: 0.5rem;
          border: 1px solid #cbd5e1;
        }
        .ProseMirror table th {
          background-color: #f1f5f9;
          font-weight: 600;
        }
        .ProseMirror blockquote {
          border-left: 4px solid #cbd5e1;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #64748b;
        }
        .ProseMirror code {
          background-color: #f1f5f9;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }
        .ProseMirror pre {
          background-color: #1e293b;
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
        .ProseMirror pre code {
          background-color: transparent;
          padding: 0;
          color: inherit;
        }
        .ProseMirror iframe {
          width: 100%;
          height: auto;
          aspect-ratio: 16/9;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
        ul[data-type="taskList"] {
          list-style: none;
          padding: 0;
        }
        ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        ul[data-type="taskList"] li > label {
          margin-top: 0.2rem;
          flex-shrink: 0;
          user-select: none;
        }
        ul[data-type="taskList"] li > div {
          flex: 1;
        }
      `}</style>
    </div>
  );
}


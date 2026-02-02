'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), {
  ssr: false,
});

interface MarkdownEditorProps {
  value: string;
  onChange: (nextValue: string) => void;
  placeholder?: string;
  height?: number;
  disabled?: boolean;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  height = 600,
  disabled = false,
}: MarkdownEditorProps) {
  const editorValue = useMemo(() => value || '', [value]);

  return (
    <div data-color-mode="light">
      <MDEditor
        value={editorValue}
        preview={disabled ? 'preview' : 'live'}
        visibleDragbar={true}
        height={height}
        textareaProps={{ placeholder, readOnly: disabled }}
        onChange={(next) => onChange(next || '')}
        hideToolbar={disabled}
        data-testid="markdown-editor"
      />
    </div>
  );
}


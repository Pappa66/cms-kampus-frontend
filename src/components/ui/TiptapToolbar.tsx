'use client';
import React from 'react';
import type { Editor } from '@tiptap/react';
import { Bold, Italic, Strikethrough, List, ListOrdered, Heading2 } from 'lucide-react';

type Props = {
  editor: Editor | null;
};

export default function TiptapToolbar({ editor }: Props) {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-t-lg border bg-gray-50 p-2">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'rounded bg-gray-200 p-2' : 'rounded p-2 hover:bg-gray-100'}>
        <Bold className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'rounded bg-gray-200 p-2' : 'rounded p-2 hover:bg-gray-100'}>
        <Italic className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} disabled={!editor.can().chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'rounded bg-gray-200 p-2' : 'rounded p-2 hover:bg-gray-100'}>
        <Strikethrough className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'rounded bg-gray-200 p-2' : 'rounded p-2 hover:bg-gray-100'}>
        <Heading2 className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'rounded bg-gray-200 p-2' : 'rounded p-2 hover:bg-gray-100'}>
        <List className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'rounded bg-gray-200 p-2' : 'rounded p-2 hover:bg-gray-100'}>
        <ListOrdered className="h-4 w-4" />
      </button>
    </div>
  );
}

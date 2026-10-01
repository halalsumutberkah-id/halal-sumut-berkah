// components/shared/rich-text-editor.tsx

'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageResize from 'tiptap-extension-resize-image';
import LinkExtension from '@tiptap/extension-link';
import { Bold, Italic, Heading2, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Undo, Redo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadImage } from '@/lib/upload-file';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
}

// diekspos ke parent lewat ref, dipanggil pas submit form buat "resolve"
// semua gambar yang masih berupa blob URL sementara (belum diupload) jadi
// URL Cloudinary asli
export interface RichTextEditorHandle {
  resolveContent: () => Promise<string>;
}

const DraggableImageResize = ImageResize.extend({
  draggable: true,
});

export const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(function RichTextEditor({ value, onChange, disabled }, ref) {
  // nyimpen mapping blob URL sementara -> File asli yang belum diupload.
  // gambar yang di-insert ke editor TIDAK langsung upload ke Cloudinary -
  // cuma dikasih preview lokal (blob URL) dulu, baru beneran diupload pas
  // resolveContent() dipanggil (biasanya pas form di-submit)
  const pendingFilesRef = useRef<Map<string, File>>(new Map());

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: false }),
      LinkExtension.configure({ openOnClick: false }),
      DraggableImageResize.configure({
        minWidth: 100,
        maxWidth: 800,
      }),
    ],
    content: value,
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content min-h-[220px] px-3 py-2 focus:outline-none',
      },
    },
  });

  useImperativeHandle(ref, () => ({
    async resolveContent() {
      const pending = pendingFilesRef.current;
      const currentHtml = editor?.getHTML() ?? value;

      if (pending.size === 0) return currentHtml;

      let html = currentHtml;

      for (const [blobUrl, file] of pending.entries()) {
        try {
          const realUrl = await uploadImage(file, 'content-images');
          html = html.split(blobUrl).join(realUrl);
        } catch {
          // kalau 1 gambar gagal upload, biarkan blob URL apa adanya -
          // gambar itu bakal rusak tampil di publik, tapi submit tetap
          // lanjut (tidak bikin seluruh artikel gagal tersimpan)
        }
      }

      pending.clear();
      return html;
    },
  }));

  if (!editor) return null;

  function handleImageUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;

      const blobUrl = URL.createObjectURL(file);
      pendingFilesRef.current.set(blobUrl, file);
      editor?.chain().focus().setImage({ src: blobUrl }).run();
    };
    input.click();
  }

  function handleSetLink() {
    const previousUrl = editor?.getAttributes('link').href as string | undefined;
    const url = window.prompt('Masukkan URL tautan:', previousUrl ?? '');
    if (url === null) return;
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }

  function toolbarButtonProps(isActive: boolean, onClick: () => void) {
    return {
      type: 'button' as const,
      variant: 'ghost' as const,
      size: 'icon' as const,
      disabled,
      onMouseDown: (e: React.MouseEvent) => e.preventDefault(),
      onClick,
      className: cn('size-8', isActive && 'bg-accent text-accent-foreground'),
    };
  }

  return (
    <div className="flex flex-col rounded-md border">
      <div className="flex flex-wrap items-center gap-1 border-b p-1.5">
        <Button {...toolbarButtonProps(editor.isActive('bold'), () => editor.chain().focus().toggleBold().run())}>
          <Bold className="size-4" />
        </Button>
        <Button {...toolbarButtonProps(editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run())}>
          <Italic className="size-4" />
        </Button>
        <Button {...toolbarButtonProps(editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run())}>
          <Heading2 className="size-4" />
        </Button>
        <Button {...toolbarButtonProps(editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run())}>
          <List className="size-4" />
        </Button>
        <Button {...toolbarButtonProps(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run())}>
          <ListOrdered className="size-4" />
        </Button>
        <Button {...toolbarButtonProps(editor.isActive('link'), handleSetLink)}>
          <LinkIcon className="size-4" />
        </Button>
        <Button {...toolbarButtonProps(false, handleImageUpload)}>
          <ImageIcon className="size-4" />
        </Button>

        <div className="mx-1 h-5 w-px bg-border" />

        <Button {...toolbarButtonProps(false, () => editor.chain().focus().undo().run())} disabled={disabled || !editor.can().undo()}>
          <Undo className="size-4" />
        </Button>
        <Button {...toolbarButtonProps(false, () => editor.chain().focus().redo().run())} disabled={disabled || !editor.can().redo()}>
          <Redo className="size-4" />
        </Button>
      </div>

      <EditorContent editor={editor} className={cn(disabled && 'opacity-60')} />
    </div>
  );
});

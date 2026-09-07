import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import { Placeholder } from '@tiptap/extension-placeholder'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
import { useState, useEffect, useRef } from 'react'
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrikethrough,
  IconH2,
  IconH3,
  IconList,
  IconListNumbers,
  IconQuote,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconClearFormatting,
  IconPalette,
  IconHighlight,
} from '@tabler/icons-react'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: string
  className?: string
}

// Pouf UI Color Palettes
const TEXT_COLORS = [
  { name: 'Default', color: '#2d2638' },
  { name: 'Pouf Purple', color: '#7c3aed' },
  { name: 'Mint Green', color: '#059669' },
  { name: 'Ocean Blue', color: '#2563eb' },
  { name: 'Warm Amber', color: '#d97706' },
  { name: 'Rose Pink', color: '#e11d48' },
  { name: 'Deep Indigo', color: '#4338ca' },
]

const HIGHLIGHT_COLORS = [
  { name: 'Tanpa Stabilo', color: '' },
  { name: 'Soft Purple', color: '#ede9fe' },
  { name: 'Soft Mint', color: '#d1fae5' },
  { name: 'Soft Yellow', color: '#fef3c7' },
  { name: 'Soft Pink', color: '#ffe4e6' },
  { name: 'Soft Sky', color: '#e0f2fe' },
]

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Tulis deskripsi atau kualifikasi di sini...',
  minHeight = '140px',
  className = '',
}: RichTextEditorProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showHighlightPicker, setShowHighlightPicker] = useState(false)

  const colorRef = useRef<HTMLDivElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)

  // Close pickers on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (colorRef.current && !colorRef.current.contains(e.target as Node)) {
        setShowColorPicker(false)
      }
      if (highlightRef.current && !highlightRef.current.contains(e.target as Node)) {
        setShowHighlightPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Underline,
      Placeholder.configure({
        placeholder,
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      if (editor.isEmpty) {
        onChange('')
      } else {
        onChange(editor.getHTML())
      }
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none text-[14px] text-[var(--ink)] leading-relaxed px-4 py-3.5 prose prose-sm max-w-none font-sans',
        style: `min-height: ${minHeight};`,
      },
    },
  })

  // Sync external value changes
  useEffect(() => {
    if (!editor) return
    const currentHTML = editor.getHTML()
    if (value !== currentHTML && !editor.isFocused) {
      editor.commands.setContent(value || '')
    }
  }, [value, editor])

  if (!editor) {
    return (
      <div
        className="w-full rounded-[18px]  bg-[var(--surface)] p-4 text-[14px] text-muted animate-pulse"
        style={{ minHeight }}
      >
        Memuat editor Pouf...
      </div>
    )
  }

  const currentColor = editor.getAttributes('textStyle').color || '#2d2638'
  const currentHighlight = editor.getAttributes('highlight').color || ''

  return (
    <div
      className={`group rounded-[20px]  bg-[var(--surface)] shadow-[0_6px_20px_-3px_rgba(124,58,237,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] transition-all duration-200 focus-within:border-[#7c3aed] focus-within:ring-4 focus-within:ring-[#7c3aed]/15 focus-within:shadow-[0_10px_28px_-4px_rgba(124,58,237,0.16)] overflow-visible ${className}`}
    >
      {/* Claymorphic Pouf Colorful Toolbar */}
      <div className="flex flex-wrap items-center gap-2 px-3.5 py-2.5  bg-gradient-to-r from-[#faf5ff] via-[#fdf2f8] to-[#f0fdfa] rounded-t-[18px]">

        {/* 1. Text Styling Group (Pastel Purple) */}
        <div className="flex items-center gap-1 bg-[#f5f0ff] p-1 rounded-[14px] border-2 border-[#e9d5ff] shadow-xs">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`inline-flex items-center justify-center min-w-[32px] h-[32px] rounded-[10px] text-xs transition-all duration-150 active:scale-90 ${
              editor.isActive('bold')
                ? 'bg-[#7c3aed] text-white border-2 border-[#6d28d9] shadow-sm ring-2 ring-[#7c3aed]/30 font-bold'
                : 'bg-[#ede9fe] text-[#6d28d9] border border-[#ddd6fe] hover:bg-[#ddd6fe] hover:text-[#5b21b6] font-semibold'
            }`}
            title="Tebal (Ctrl+B)"
          >
            <IconBold size={16} stroke={2.5} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`inline-flex items-center justify-center min-w-[32px] h-[32px] rounded-[10px] text-xs transition-all duration-150 active:scale-90 ${
              editor.isActive('italic')
                ? 'bg-[#7c3aed] text-white border-2 border-[#6d28d9] shadow-sm ring-2 ring-[#7c3aed]/30 font-bold'
                : 'bg-[#ede9fe] text-[#6d28d9] border border-[#ddd6fe] hover:bg-[#ddd6fe] hover:text-[#5b21b6] font-semibold'
            }`}
            title="Miring (Ctrl+I)"
          >
            <IconItalic size={16} stroke={2.5} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`inline-flex items-center justify-center min-w-[32px] h-[32px] rounded-[10px] text-xs transition-all duration-150 active:scale-90 ${
              editor.isActive('underline')
                ? 'bg-[#7c3aed] text-white border-2 border-[#6d28d9] shadow-sm ring-2 ring-[#7c3aed]/30 font-bold'
                : 'bg-[#ede9fe] text-[#6d28d9] border border-[#ddd6fe] hover:bg-[#ddd6fe] hover:text-[#5b21b6] font-semibold'
            }`}
            title="Garis Bawah (Ctrl+U)"
          >
            <IconUnderline size={16} stroke={2.5} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`inline-flex items-center justify-center min-w-[32px] h-[32px] rounded-[10px] text-xs transition-all duration-150 active:scale-90 ${
              editor.isActive('strike')
                ? 'bg-[#7c3aed] text-white border-2 border-[#6d28d9] shadow-sm ring-2 ring-[#7c3aed]/30 font-bold'
                : 'bg-[#ede9fe] text-[#6d28d9] border border-[#ddd6fe] hover:bg-[#ddd6fe] hover:text-[#5b21b6] font-semibold'
            }`}
            title="Coretan (Strikethrough)"
          >
            <IconStrikethrough size={16} stroke={2.5} />
          </button>
        </div>

        {/* 2. Color & Highlight Picker Group (Indigo & Amber) */}
        <div className="flex items-center gap-1 bg-[#eef2ff] p-1 rounded-[14px] border-2 border-[#c7d2fe] shadow-xs">
          {/* Text Color Picker */}
          <div className="relative" ref={colorRef}>
            <button
              type="button"
              onClick={() => {
                setShowColorPicker((v) => !v)
                setShowHighlightPicker(false)
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 h-[32px] rounded-[10px] text-xs transition-all duration-150 active:scale-90 ${
                showColorPicker
                  ? 'bg-[#4338ca] text-white border-2 border-[#3730a3] shadow-sm ring-2 ring-[#4338ca]/30 font-bold'
                  : 'bg-[#e0e7ff] text-[#4338ca] border border-[#c7d2fe] hover:bg-[#c7d2fe] hover:text-[#312e81] font-semibold'
              }`}
              title="Warna Teks"
            >
              <IconPalette size={16} stroke={2.4} />
              <span
                className="w-3 h-3 rounded-full border-2 border-white shadow-xs"
                style={{ backgroundColor: currentColor }}
              />
            </button>

            {showColorPicker && (
              <div className="absolute top-full mt-2 left-0 z-50 bg-[var(--surface)] p-2.5 rounded-[16px] shadow-[0_12px_28px_-4px_rgba(67,56,202,0.25),0_4px_12px_-2px_rgba(0,0,0,0.08)] border-2 border-[#c7d2fe] min-w-[180px] animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[11px] font-bold text-[#4338ca] px-1 pb-1.5 mb-1.5 border-b border-[#e0e7ff] tracking-wide">
                  PILIH WARNA TEKS
                </div>
                <div className="grid grid-cols-4 gap-1.5 p-1">
                  {TEXT_COLORS.map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => {
                        editor.chain().focus().setColor(c.color).run()
                        setShowColorPicker(false)
                      }}
                      className="w-7 h-7 rounded-[8px] flex items-center justify-center transition-transform hover:scale-115 active:scale-95 shadow-xs relative border border-black/10"
                      style={{ backgroundColor: c.color }}
                      title={c.name}
                    >
                      {currentColor === c.color && (
                        <span className="w-2 h-2 rounded-full bg-white shadow-xs" />
                      )}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().unsetColor().run()
                    setShowColorPicker(false)
                  }}
                  className="w-full mt-2 py-1.5 text-[11px] font-semibold text-center text-[#4338ca] hover:bg-[#e0e7ff] rounded-[10px] transition-colors"
                >
                  Reset ke Default
                </button>
              </div>
            )}
          </div>

          {/* Highlight Marker Picker */}
          <div className="relative" ref={highlightRef}>
            <button
              type="button"
              onClick={() => {
                setShowHighlightPicker((v) => !v)
                setShowColorPicker(false)
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 h-[32px] rounded-[10px] text-xs transition-all duration-150 active:scale-90 ${
                showHighlightPicker || Boolean(currentHighlight)
                  ? 'bg-[#d97706] text-white border-2 border-[#b45309] shadow-sm ring-2 ring-[#d97706]/30 font-bold'
                  : 'bg-[#fef3c7] text-[#92400e] border border-[#fde68a] hover:bg-[#fde68a] hover:text-[#78350f] font-semibold'
              }`}
              title="Warna Stabilo / Highlight"
            >
              <IconHighlight size={16} stroke={2.4} />
              {currentHighlight ? (
                <span
                  className="w-3 h-3 rounded-full border-2 border-white shadow-xs"
                  style={{ backgroundColor: currentHighlight }}
                />
              ) : null}
            </button>

            {showHighlightPicker && (
              <div className="absolute top-full mt-2 left-0 z-50 bg-[var(--surface)] p-2.5 rounded-[16px] shadow-[0_12px_28px_-4px_rgba(217,119,6,0.25),0_4px_12px_-2px_rgba(0,0,0,0.08)] border-2 border-[#fde68a] min-w-[180px] animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[11px] font-bold text-[#92400e] px-1 pb-1.5 mb-1.5 border-b border-[#fef3c7] tracking-wide">
                  WARNA STABILO
                </div>
                <div className="grid grid-cols-3 gap-1.5 p-1">
                  {HIGHLIGHT_COLORS.filter((h) => h.color).map((h) => (
                    <button
                      key={h.color}
                      type="button"
                      onClick={() => {
                        editor.chain().focus().setHighlight({ color: h.color }).run()
                        setShowHighlightPicker(false)
                      }}
                      className="h-7 rounded-[8px] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-xs border border-black/10 text-[10px] font-bold text-[var(--ink)]"
                      style={{ backgroundColor: h.color }}
                      title={h.name}
                    >
                      {h.name.replace('Soft ', '')}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().unsetHighlight().run()
                    setShowHighlightPicker(false)
                  }}
                  className="w-full mt-2 py-1.5 text-[11px] font-semibold text-center text-[#92400e] hover:bg-[#fef3c7] rounded-[10px] transition-colors"
                >
                  Hapus Stabilo
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3. Headings Group (Pastel Rose/Pink) */}
        <div className="flex items-center gap-1 bg-[#fff1f2] p-1 rounded-[14px] border-2 border-[#fecdd3] shadow-xs">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`inline-flex items-center justify-center min-w-[32px] h-[32px] rounded-[10px] text-xs transition-all duration-150 active:scale-90 ${
              editor.isActive('heading', { level: 2 })
                ? 'bg-[#e11d48] text-white border-2 border-[#be123c] shadow-sm ring-2 ring-[#e11d48]/30 font-bold'
                : 'bg-[#ffe4e6] text-[#e11d48] border border-[#fecdd3] hover:bg-[#fecdd3] hover:text-[#be123c] font-semibold'
            }`}
            title="Heading 2 (Judul Bagian)"
          >
            <IconH2 size={16} stroke={2.5} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`inline-flex items-center justify-center min-w-[32px] h-[32px] rounded-[10px] text-xs transition-all duration-150 active:scale-90 ${
              editor.isActive('heading', { level: 3 })
                ? 'bg-[#e11d48] text-white border-2 border-[#be123c] shadow-sm ring-2 ring-[#e11d48]/30 font-bold'
                : 'bg-[#ffe4e6] text-[#e11d48] border border-[#fecdd3] hover:bg-[#fecdd3] hover:text-[#be123c] font-semibold'
            }`}
            title="Heading 3 (Sub Judul)"
          >
            <IconH3 size={16} stroke={2.5} />
          </button>
        </div>

        {/* 4. Lists & Quotes Group (Pastel Emerald/Mint) */}
        <div className="flex items-center gap-1 bg-[#ecfdf5] p-1 rounded-[14px] border-2 border-[#a7f3d0] shadow-xs">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`inline-flex items-center justify-center min-w-[32px] h-[32px] rounded-[10px] text-xs transition-all duration-150 active:scale-90 ${
              editor.isActive('bulletList')
                ? 'bg-[#059669] text-white border-2 border-[#047857] shadow-sm ring-2 ring-[#059669]/30 font-bold'
                : 'bg-[#d1fae5] text-[#059669] border border-[#a7f3d0] hover:bg-[#a7f3d0] hover:text-[#047857] font-semibold'
            }`}
            title="Poin Peluru (Bullet List)"
          >
            <IconList size={16} stroke={2.5} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`inline-flex items-center justify-center min-w-[32px] h-[32px] rounded-[10px] text-xs transition-all duration-150 active:scale-90 ${
              editor.isActive('orderedList')
                ? 'bg-[#059669] text-white border-2 border-[#047857] shadow-sm ring-2 ring-[#059669]/30 font-bold'
                : 'bg-[#d1fae5] text-[#059669] border border-[#a7f3d0] hover:bg-[#a7f3d0] hover:text-[#047857] font-semibold'
            }`}
            title="Daftar Bernomor (Numbered List)"
          >
            <IconListNumbers size={16} stroke={2.5} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`inline-flex items-center justify-center min-w-[32px] h-[32px] rounded-[10px] text-xs transition-all duration-150 active:scale-90 ${
              editor.isActive('blockquote')
                ? 'bg-[#059669] text-white border-2 border-[#047857] shadow-sm ring-2 ring-[#059669]/30 font-bold'
                : 'bg-[#d1fae5] text-[#059669] border border-[#a7f3d0] hover:bg-[#a7f3d0] hover:text-[#047857] font-semibold'
            }`}
            title="Kutipan (Blockquote)"
          >
            <IconQuote size={16} stroke={2.5} />
          </button>
        </div>

        {/* 5. History & Utilities Group (Pastel Sky & Fuchsia) */}
        <div className="flex items-center gap-1 bg-[#f0f9ff] p-1 rounded-[14px] border-2 border-[#bae6fd] shadow-xs ml-auto">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="inline-flex items-center justify-center min-w-[30px] h-[30px] rounded-[8px] bg-[#e0f2fe] text-[#0284c7] border border-[#bae6fd] hover:bg-[#bae6fd] hover:text-[#0369a1] disabled:opacity-35 disabled:pointer-events-none transition-all duration-150 active:scale-90 font-semibold"
            title="Undo (Urungkan)"
          >
            <IconArrowBackUp size={16} stroke={2.3} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="inline-flex items-center justify-center min-w-[30px] h-[30px] rounded-[8px] bg-[#e0f2fe] text-[#0284c7] border border-[#bae6fd] hover:bg-[#bae6fd] hover:text-[#0369a1] disabled:opacity-35 disabled:pointer-events-none transition-all duration-150 active:scale-90 font-semibold"
            title="Redo (Ulangi)"
          >
            <IconArrowForwardUp size={16} stroke={2.3} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            className="inline-flex items-center justify-center min-w-[30px] h-[30px] rounded-[8px] bg-[#fae8ff] text-[#c026d3] border border-[#f5d0fe] hover:bg-[#f5d0fe] hover:text-[#a21caf] transition-all duration-150 active:scale-90 font-semibold"
            title="Hapus Format Teks"
          >
            <IconClearFormatting size={16} stroke={2.3} />
          </button>
        </div>
      </div>

      {/* Editor Writing Area */}
      <div className="bg-[var(--surface)] rounded-b-[16px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

/**
 * Component to safely render rich text HTML content with Pouf formatting styles.
 */
export function RichContentViewer({
  content,
  className = '',
}: {
  content?: string | null
  className?: string
}) {
  if (!content) return null

  const isHTML = /<\/?[a-z][\s\S]*>/i.test(content)

  if (isHTML) {
    return (
      <div
        className={`rich-text-content text-[14px] text-[var(--ink)] leading-relaxed font-sans ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  return (
    <div className={`text-[14px] text-[var(--ink)] whitespace-pre-line leading-relaxed font-sans ${className}`}>
      {content}
    </div>
  )
}

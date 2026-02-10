'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import LinkExtension from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  Save,
  ArrowRight,
  Sparkles,
  Wand2,
  Scissors,
  Minimize2
} from 'lucide-react'

interface EditorClientProps {
  post: {
    id: string
    title: string
    content: string
    wordCount?: number | null
    readingTimeMinutes?: number | null
  }
}

function calculateReadability(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const words = text.split(/\s+/).filter(w => w.length > 0)
  const syllables = words.reduce((count, word) => {
    return count + word.toLowerCase().split(/[aeiou]/).length - 1
  }, 0)
  
  if (sentences.length === 0 || words.length === 0) return 0
  
  const score = 206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (syllables / words.length)
  return Math.max(0, Math.min(100, Math.round(score)))
}

export function EditorClient({ post }: EditorClientProps) {
  const router = useRouter()
  const [title, setTitle] = useState(post.title)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const [selectedText, setSelectedText] = useState('')
  const [showAiTools, setShowAiTools] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkExtension.configure({
        openOnClick: false,
      }),
      Image,
      Underline,
      Placeholder.configure({
        placeholder: 'Start writing your blog post...',
      }),
    ],
    content: post.content,
    onUpdate: ({ editor }) => {
      setSaveStatus('unsaved')
    },
  })

  const wordCount = editor?.storage.characterCount?.words || post.wordCount || 0
  const readingTime = Math.ceil(wordCount / 200)
  const readability = calculateReadability(editor?.getText() || '')

  useEffect(() => {
    if (saveStatus !== 'unsaved') return

    const timer = setTimeout(() => {
      handleSave()
    }, 30000)

    return () => clearTimeout(timer)
  }, [saveStatus])

  const handleSave = useCallback(async () => {
    if (!editor) return
    
    setSaveStatus('saving')
    
    try {
      const response = await fetch(`/api/posts/${post.id}/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: editor.getHTML()
        })
      })

      if (response.ok) {
        setSaveStatus('saved')
      }
    } catch (error) {
      console.error('Save error:', error)
      setSaveStatus('unsaved')
    }
  }, [editor, post.id, title])

  const handleSelection = useCallback(() => {
    if (!editor) return
    const { from, to } = editor.state.selection
    if (from !== to) {
      const text = editor.state.doc.textBetween(from, to)
      setSelectedText(text)
      setShowAiTools(true)
    } else {
      setSelectedText('')
      setShowAiTools(false)
    }
  }, [editor])

  const handleAiAction = async (action: string) => {
    if (!editor || !selectedText) return
    
    setAiLoading(true)
    
    try {
      const response = await fetch('/api/ai/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: selectedText,
          instruction: action,
          tone: 'professional'
        })
      })

      if (response.ok) {
        const data = await response.json()
        editor.commands.setContent(
          editor.getHTML().replace(selectedText, data.rewrittenText)
        )
        setSaveStatus('unsaved')
      }
    } catch (error) {
      console.error('AI action error:', error)
    } finally {
      setAiLoading(false)
    }
  }

  if (!editor) {
    return <div>Loading editor...</div>
  }

  const headings = editor.getJSON().content?.filter((node: any) => 
    node.type === 'heading' && node.attrs?.level === 2
  ) || []

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-xl font-bold text-slate-900">
              BlogAI
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-sm text-slate-500">
              {saveStatus === 'saved' && 'Saved'}
              {saveStatus === 'saving' && 'Saving...'}
              {saveStatus === 'unsaved' && 'Unsaved changes'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </button>
            <button
              onClick={() => router.push(`/editor/${post.id}/seo`)}
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Next: SEO
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
          <div className="space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                setSaveStatus('unsaved')
              }}
              className="w-full border-0 bg-transparent text-3xl font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0"
              placeholder="Post Title"
            />

            <div className="flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-white p-2">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`rounded p-2 ${editor.isActive('bold') ? 'bg-slate-200' : 'hover:bg-slate-100'}`}
              >
                <Bold className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`rounded p-2 ${editor.isActive('italic') ? 'bg-slate-200' : 'hover:bg-slate-100'}`}
              >
                <Italic className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`rounded p-2 ${editor.isActive('underline') ? 'bg-slate-200' : 'hover:bg-slate-100'}`}
              >
                <UnderlineIcon className="h-4 w-4" />
              </button>
              <div className="mx-2 w-px bg-slate-200" />
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`rounded p-2 ${editor.isActive('heading', { level: 1 }) ? 'bg-slate-200' : 'hover:bg-slate-100'}`}
              >
                <Heading1 className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`rounded p-2 ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200' : 'hover:bg-slate-100'}`}
              >
                <Heading2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`rounded p-2 ${editor.isActive('heading', { level: 3 }) ? 'bg-slate-200' : 'hover:bg-slate-100'}`}
              >
                <Heading3 className="h-4 w-4" />
              </button>
              <div className="mx-2 w-px bg-slate-200" />
              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`rounded p-2 ${editor.isActive('bulletList') ? 'bg-slate-200' : 'hover:bg-slate-100'}`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`rounded p-2 ${editor.isActive('orderedList') ? 'bg-slate-200' : 'hover:bg-slate-100'}`}
              >
                <ListOrdered className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`rounded p-2 ${editor.isActive('blockquote') ? 'bg-slate-200' : 'hover:bg-slate-100'}`}
              >
                <Quote className="h-4 w-4" />
              </button>
              <div className="mx-2 w-px bg-slate-200" />
              <button
                onClick={() => editor.chain().focus().undo().run()}
                className="rounded p-2 hover:bg-slate-100"
              >
                <Undo className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().redo().run()}
                className="rounded p-2 hover:bg-slate-100"
              >
                <Redo className="h-4 w-4" />
              </button>
            </div>

            <div
              className="min-h-[500px] rounded-lg border border-slate-200 bg-white p-6"
              onMouseUp={handleSelection}
              onKeyUp={handleSelection}
            >
              <EditorContent
                editor={editor}
                className="prose prose-slate max-w-none focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <h3 className="mb-3 font-semibold text-slate-900">Table of Contents</h3>
              {headings.length === 0 ? (
                <p className="text-sm text-slate-500">Add H2 headings to see them here</p>
              ) : (
                <ul className="space-y-2">
                  {headings.map((heading: any, i: number) => (
                    <li key={i} className="text-sm">
                      <button
                        onClick={() => {
                          editor.commands.focus()
                          editor.commands.scrollIntoView()
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {heading.content?.[0]?.text || `Section ${i + 1}`}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-lg bg-white p-4 shadow-sm">
              <h3 className="mb-3 font-semibold text-slate-900">Metrics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Word Count:</span>
                  <span className="font-medium">{wordCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Reading Time:</span>
                  <span className="font-medium">{readingTime} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Readability:</span>
                  <span className={`font-medium ${
                    readability > 80 ? 'text-green-600' : readability > 50 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {readability}/100
                  </span>
                </div>
              </div>
            </div>

            {showAiTools && selectedText && (
              <div className="rounded-lg bg-blue-50 p-4 shadow-sm">
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-blue-900">
                  <Sparkles className="h-4 w-4" />
                  AI Tools
                </h3>
                <p className="mb-3 text-xs text-blue-700">Selected: {selectedText.substring(0, 50)}...</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAiAction('rewrite')}
                    disabled={aiLoading}
                    className="flex items-center gap-1 rounded bg-white px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                  >
                    <Wand2 className="h-3 w-3" />
                    Rewrite
                  </button>
                  <button
                    onClick={() => handleAiAction('expand')}
                    disabled={aiLoading}
                    className="flex items-center gap-1 rounded bg-white px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                  >
                    <Scissors className="h-3 w-3" />
                    Expand
                  </button>
                  <button
                    onClick={() => handleAiAction('shorten')}
                    disabled={aiLoading}
                    className="flex items-center gap-1 rounded bg-white px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                  >
                    <Minimize2 className="h-3 w-3" />
                    Shorten
                  </button>
                  <button
                    onClick={() => handleAiAction('simplify')}
                    disabled={aiLoading}
                    className="flex items-center gap-1 rounded bg-white px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                  >
                    <Sparkles className="h-3 w-3" />
                    Simplify
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
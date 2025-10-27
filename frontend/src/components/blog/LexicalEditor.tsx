'use client'

import { useState, useCallback } from 'react'
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListItemNode, ListNode } from '@lexical/list'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { LinkNode } from '@lexical/link'
import { CodeNode } from '@lexical/code'
import { Button } from '@/components/ui/button'
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Heading1, 
  Heading2,
  Undo,
  Redo
} from 'lucide-react'
import { $setBlocksType } from '@lexical/selection'
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text'
import { $createCodeNode } from '@lexical/code'
import { 
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND
} from '@lexical/list'
import { 
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  $getSelection,
  $isRangeSelection
} from 'lexical'

interface LexicalEditorProps {
  initialContent?: string
  onChange: (content: string) => void
  placeholder?: string
}

// Toolbar Component
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()

  const formatText = (format: 'bold' | 'italic' | 'underline') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)
  }

  const formatHeading = (headingSize: 'h1' | 'h2') => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(headingSize))
      }
    })
  }

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode())
      }
    })
  }

  const formatCode = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createCodeNode())
      }
    })
  }

  const insertList = (listType: 'bullet' | 'number') => {
    if (listType === 'bullet') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
    } else {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
    }
  }

  const undo = () => {
    editor.dispatchCommand(UNDO_COMMAND, undefined)
  }

  const redo = () => {
    editor.dispatchCommand(REDO_COMMAND, undefined)
  }

  return (
    <div className="border-b bg-gray-50 p-2 flex flex-wrap gap-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={undo}
        title="Undo"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={redo}
        title="Redo"
      >
        <Redo className="h-4 w-4" />
      </Button>
      
      <div className="w-px bg-gray-300 mx-1" />
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => formatText('bold')}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => formatText('italic')}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => formatText('underline')}
        title="Underline"
      >
        <Underline className="h-4 w-4" />
      </Button>
      
      <div className="w-px bg-gray-300 mx-1" />
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => formatHeading('h1')}
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => formatHeading('h2')}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      
      <div className="w-px bg-gray-300 mx-1" />
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => insertList('bullet')}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => insertList('number')}
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      
      <div className="w-px bg-gray-300 mx-1" />
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={formatQuote}
        title="Quote"
      >
        <Quote className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={formatCode}
        title="Code Block"
      >
        <Code className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default function LexicalEditor({ initialContent, onChange, placeholder = 'Start writing...' }: LexicalEditorProps) {
  const initialConfig = {
    namespace: 'BlogEditor',
    theme: {
      paragraph: 'mb-2',
      quote: 'border-l-4 border-gray-300 pl-4 italic my-4',
      heading: {
        h1: 'text-3xl font-bold my-4',
        h2: 'text-2xl font-bold my-3',
        h3: 'text-xl font-bold my-2',
      },
      list: {
        ul: 'list-disc list-inside my-2',
        ol: 'list-decimal list-inside my-2',
        listitem: 'ml-4',
      },
      text: {
        bold: 'font-bold',
        italic: 'italic',
        underline: 'underline',
        code: 'bg-gray-100 px-1 py-0.5 rounded font-mono text-sm',
      },
      code: 'bg-gray-900 text-white p-4 rounded my-4 font-mono text-sm overflow-x-auto block',
    },
    onError: (error: Error) => {
      console.error('Lexical Error:', error)
    },
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      LinkNode,
    ],
    editorState: initialContent && initialContent.trim() !== '' ? initialContent : undefined,
  }

  const handleChange = useCallback((editorState: any) => {
    editorState.read(() => {
      const root = $getRoot()
      const htmlString = root.getTextContent()
      onChange(JSON.stringify(editorState.toJSON()))
    })
  }, [onChange])

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="relative border rounded-lg overflow-hidden bg-white">
        <ToolbarPlugin />
        <div className="relative min-h-[400px]">
          <RichTextPlugin
            contentEditable={
              <ContentEditable 
                className="min-h-[400px] p-4 outline-none prose max-w-none"
                aria-placeholder={placeholder}
                placeholder={
                  <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
                    {placeholder}
                  </div>
                }
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <OnChangePlugin onChange={handleChange} />
        <ListPlugin />
        <LinkPlugin />
      </div>
    </LexicalComposer>
  )
}


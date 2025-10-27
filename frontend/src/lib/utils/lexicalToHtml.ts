/**
 * Convert Lexical editor JSON to HTML for display
 * This is a simple converter - for production, consider using @lexical/html
 */
export function lexicalToHtml(lexicalJson: string): string {
  try {
    const editorState = JSON.parse(lexicalJson)
    
    if (!editorState || !editorState.root) {
      return '<p>No content available</p>'
    }

    const renderNode = (node: any): string => {
      if (!node) return ''

      // Text node
      if (node.type === 'text') {
        let text = node.text || ''
        
        // Apply formatting
        if (node.format && node.format & 1) text = `<strong>${text}</strong>` // Bold
        if (node.format && node.format & 2) text = `<em>${text}</em>` // Italic
        if (node.format && node.format & 8) text = `<u>${text}</u>` // Underline
        if (node.format && node.format & 16) text = `<code>${text}</code>` // Code
        
        return text
      }

      // Get children content
      const children = node.children?.map(renderNode).join('') || ''

      // Block nodes
      switch (node.type) {
        case 'paragraph':
          return `<p class="mb-4">${children}</p>`
        
        case 'heading':
          const level = node.tag || 'h2'
          return `<${level} class="font-bold my-4 ${
            level === 'h1' ? 'text-3xl' : level === 'h2' ? 'text-2xl' : 'text-xl'
          }">${children}</${level}>`
        
        case 'quote':
          return `<blockquote class="border-l-4 border-gray-300 pl-4 italic my-4">${children}</blockquote>`
        
        case 'code':
          return `<pre class="bg-gray-900 text-white p-4 rounded my-4 overflow-x-auto"><code>${children}</code></pre>`
        
        case 'list':
          const listTag = node.listType === 'number' ? 'ol' : 'ul'
          const listClass = node.listType === 'number' ? 'list-decimal' : 'list-disc'
          return `<${listTag} class="${listClass} list-inside my-4 ml-4">${children}</${listTag}>`
        
        case 'listitem':
          return `<li class="mb-1">${children}</li>`
        
        case 'link':
          return `<a href="${node.url || '#'}" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">${children}</a>`
        
        default:
          return children
      }
    }

    return renderNode(editorState.root)
  } catch (error) {
    console.error('Error converting Lexical to HTML:', error)
    return '<p>Error rendering content</p>'
  }
}


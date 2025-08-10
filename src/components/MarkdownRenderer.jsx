import React from 'react'

const MarkdownRenderer = ({ content }) => {
  // 간단한 마크다운 렌더링 함수
  const renderMarkdown = (text) => {
    if (!text) return ''
    
    return text
      // 코드 블록
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      // 인라인 코드
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // 볼드
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // 이탤릭
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // 헤더
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // 리스트
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      // 줄바꿈을 paragraph로
      .split('\n\n')
      .map(paragraph => paragraph.trim() ? `<p>${paragraph.replace(/\n/g, '<br>')}</p>` : '')
      .join('')
  }

  return (
    <div 
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  )
}

export default MarkdownRenderer
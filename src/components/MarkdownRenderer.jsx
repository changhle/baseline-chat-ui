import "katex/dist/katex.min.css";
import katex from "katex";

const MarkdownRenderer = ({ content }) => {
  const renderMarkdown = (text) => {
    if (!text) return ''

    // --- LaTeX 수식 먼저 변환 ---
    // 블록 수식: $$...$$ 또는 \[...\]
    text = text.replace(/\$\$([^$]+)\$\$|\\\[([\s\S]+?)\\\]/g, (_, f1, f2) => {
      const formula = f1 || f2
      try {
        return katex.renderToString(formula, { displayMode: true, throwOnError: false })
      } catch (err) {
        return `<code>${formula}</code>`
      }
    })

    // 인라인 수식: $...$ 또는 \(...\)
    text = text.replace(/\$([^$]+)\$|\\\(([\s\S]+?)\\\)/g, (_, f1, f2) => {
      const formula = f1 || f2
      try {
        return katex.renderToString(formula, { displayMode: false, throwOnError: false })
      } catch (err) {
        return `<code>${formula}</code>`
      }
    })

    // --- 나머지 마크다운 치환 ---
    let html = text
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

    // --- 문단 나누기 + 줄바꿈 변환 ---
    html = html
      .split('\n\n')
      .map(paragraph =>
        paragraph.trim()
          ? `<p>${paragraph.replace(/\n/g, '<br>')}</p>`
          : ''
      )
      .join('')

    return html
  }

  return (
    <div
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
};

export default MarkdownRenderer;

import React, { useState, useEffect, useRef } from 'react';
import { loadPrism, loadPrismLanguage } from '@/utils/loadPrism';

interface ASyntaxHighLightProps {
  language?: string;
  children: any;
  style?: React.CSSProperties;
}

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" />
  </svg>
);

export const ASyntaxHighLight: React.FC<ASyntaxHighLightProps> = ({
  language = 'javascript',
  children,
  style
}) => {
  const [copied, setCopied] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const codeRef = useRef<HTMLElement>(null);

  // 获取代码文本
  const codeText = typeof children === 'string' 
    ? children 
    : Array.isArray(children) 
      ? children.join('') 
      : String(children || '');

  // 加载 Prism 并高亮代码
  useEffect(() => {
    let isMounted = true;

    const highlight = async () => {
      try {
        setIsLoading(true);
        const Prism = await loadPrism();
        await loadPrismLanguage(language);

        if (!isMounted) return;

        // 获取语法定义
        const grammar = Prism.languages[language] || Prism.languages.javascript;
        const highlighted = Prism.highlight(codeText.replace(/\n$/, ''), grammar, language);
        
        setHighlightedCode(highlighted);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to highlight code:', error);
        if (isMounted) {
          setHighlightedCode(escapeHtml(codeText));
          setIsLoading(false);
        }
      }
    };

    highlight();

    return () => {
      isMounted = false;
    };
  }, [codeText, language]);

  // HTML 转义函数
  const escapeHtml = (text: string) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // 计算行号
  const lines = codeText.split('\n');
  const lineCount = lines[lines.length - 1] === '' ? lines.length - 1 : lines.length;

  return (
    <div style={{ position: 'relative', ...style }}>
      <pre 
        className="line-numbers"
        style={{
          margin: 0,
          padding: '1em',
          paddingLeft: '3.8em',
          overflow: 'auto',
          background: '#e3eaf2',
          borderRadius: '4px',
          fontSize: '13px',
          lineHeight: '1.5',
          fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
        }}
      >
        {/* 行号 */}
        <span 
          className="line-numbers-rows"
          style={{
            position: 'absolute',
            left: 0,
            top: '1em',
            width: '3em',
            borderRight: '1px solid #8da1b9',
            textAlign: 'right',
            paddingRight: '0.8em',
            userSelect: 'none',
            color: '#8da1b9',
            fontSize: '13px',
            lineHeight: '1.5',
          }}
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <span key={i} style={{ display: 'block' }}>{i + 1}</span>
          ))}
        </span>
        
        <code
          ref={codeRef}
          className={`language-${language}`}
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
          dangerouslySetInnerHTML={
            isLoading 
              ? { __html: escapeHtml(codeText) }
              : { __html: highlightedCode }
          }
        />
      </pre>
      
      {/* 复制按钮 */}
      <button
        onClick={handleCopy}
        style={{
          position: 'absolute',
          right: '8px',
          top: '8px',
          padding: '4px 8px',
          background: 'rgba(255,255,255,0.8)',
          border: '1px solid #ccc',
          borderRadius: '4px',
          cursor: 'pointer',
          opacity: 0.7,
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: '#333',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.background = 'rgba(255,255,255,1)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.opacity = '0.7';
          e.currentTarget.style.background = 'rgba(255,255,255,0.8)';
        }}
        title={copied ? 'Copied!' : 'Copy code'}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
        <span style={{ marginLeft: '4px' }}>{copied ? 'Copied' : 'Copy'}</span>
      </button>
    </div>
  );
};

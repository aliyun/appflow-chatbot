import React, { useEffect, useRef, useState } from 'react';
import loadMermaidScript from '@/utils/loadMermaid';
import { useTranslation } from '@/i18n';

interface IProps {
  code: string;
}

// 生成唯一ID
let mermaidIdCounter = 0;
const generateMermaidId = () => `mermaid-${Date.now()}-${mermaidIdCounter++}`;

// 检查 mermaid 代码是否可能完整
const isMermaidCodeComplete = (code: string): boolean => {
  if (!code || code.trim().length < 10) return false;
  
  const trimmed = code.trim();
  
  // 检查是否有基本的图表类型声明
  const graphTypes = [
    'graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 
    'stateDiagram', 'erDiagram', 'journey', 'gantt', 'pie', 
    'quadrantChart', 'requirementDiagram', 'gitGraph', 'mindmap', 'timeline'
  ];
  
  const hasGraphType = graphTypes.some(type => 
    trimmed.startsWith(type) || trimmed.match(new RegExp(`^${type}\\s`, 'm'))
  );
  
  if (!hasGraphType) return false;
  
  // 检查是否有至少一个完整的节点或连接定义
  // 对于 flowchart/graph: A --> B 或 A[text]
  // 对于 sequenceDiagram: participant A 或 A->>B
  const hasContent = /(\w+\s*-->|\w+\s*---|\w+\s*-\.->|\w+\s*==>|\w+\s*\[.*?\]|\w+\s*\(.*?\)|participant\s+\w+|\w+\s*->>)/m.test(trimmed);
  
  return hasContent;
};

export const Mermaid: React.FC<IProps> = ({ code }) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isMermaidLoaded, setIsMermaidLoaded] = useState(false);
  const [isStreaming, setIsStreaming] = useState(true);
  const lastCodeRef = useRef<string>('');
  const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stableTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 加载mermaid脚本
  useEffect(() => {
    const initMermaid = async () => {
      try {
        await loadMermaidScript();
        setIsMermaidLoaded(true);
      } catch (error) {
        console.error('mermaid加载失败:', error);
        setError(t('markdown.mermaidLoadFailed'));
        setIsLoading(false);
      }
    };

    initMermaid();

    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
      if (stableTimeoutRef.current) {
        clearTimeout(stableTimeoutRef.current);
      }
    };
  }, []);

  // 渲染mermaid图表（带防抖）
  useEffect(() => {
    if (!code || !isMermaidLoaded) return;

    const mermaid = (window as any).mermaid;
    if (!mermaid) {
      setError(t('markdown.mermaidNotLoaded'));
      setIsLoading(false);
      return;
    }

    // 检查代码是否变化
    const codeChanged = code !== lastCodeRef.current;
    lastCodeRef.current = code;

    // 如果代码变化了，说明还在流式输出
    if (codeChanged) {
      setIsStreaming(true);
      
      // 清除之前的稳定检测定时器
      if (stableTimeoutRef.current) {
        clearTimeout(stableTimeoutRef.current);
      }
      
      // 设置新的稳定检测定时器（500ms 没有变化认为稳定）
      stableTimeoutRef.current = setTimeout(() => {
        setIsStreaming(false);
      }, 500);
    }

    // 检查代码是否可能完整
    if (!isMermaidCodeComplete(code)) {
      // 代码不完整，显示加载状态
      setIsLoading(true);
      setError('');
      return;
    }

    // 清除之前的渲染定时器
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }

    // 使用防抖延迟渲染（300ms）
    renderTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const id = generateMermaidId();
        const { svg } = await mermaid.render(id, code.trim());
        setSvg(svg);
        setError('');
        
        // 清理mermaid.render()创建的临时DOM元素
        const tempDiv = document.getElementById(id);
        if (tempDiv) {
          tempDiv.remove();
        }
      } catch (err: any) {
        // 清理可能创建的临时DOM元素
        const tempDivs = document.querySelectorAll('[id^="dmermaid-"]');
        tempDivs.forEach(div => div.remove());
        
        // 如果还在流式输出中，不显示错误，继续显示加载状态
        if (isStreaming) {
          console.log('Mermaid 流式输出中，暂不显示错误');
          // 保持加载状态，不设置错误
        } else {
          // 流式输出结束后，如果仍然有错误，才显示错误
          console.error('Mermaid 渲染错误:', err);
          setError(err?.message || t('markdown.mermaidRenderFailed'));
        }
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, [code, isMermaidLoaded, isStreaming]);

  // 加载状态
  if (isLoading) {
    return (
      <div 
        style={{ 
          width: '100%', 
          minHeight: '100px',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px dashed #d9d9d9',
          borderRadius: '6px',
          color: '#666',
          backgroundColor: '#fafafa',
          marginTop: '10px',
          marginBottom: '10px',
        }}
      >
        {t('markdown.chartLoading')}
      </div>
    );
  }

  // 错误状态（只在非流式输出时显示）
  if (error && !isStreaming) {
    return (
      <div 
        style={{ 
          width: '100%', 
          padding: '20px',
          border: '1px solid #ffccc7',
          borderRadius: '6px',
          color: '#cf1322',
          backgroundColor: '#fff2f0',
          marginTop: '10px',
          marginBottom: '10px',
        }}
      >
        <div 
          style={{ 
            fontWeight: 'bold',
            marginBottom: '8px'
          }}
        >
          {t('markdown.mermaidRenderFailed')}
        </div>
        <div 
          style={{ 
            fontSize: '12px',
            color: '#666',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            whiteSpace: 'pre-wrap'
          }}
        >
          {error}
        </div>
      </div>
    );
  }

  // 如果有错误但还在流式输出，显示加载状态
  if (error && isStreaming) {
    return (
      <div 
        style={{ 
          width: '100%', 
          minHeight: '100px',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px dashed #d9d9d9',
          borderRadius: '6px',
          color: '#666',
          backgroundColor: '#fafafa',
          marginTop: '10px',
          marginBottom: '10px',
        }}
      >
        {t('markdown.chartLoading')}
      </div>
    );
  }

  // 成功渲染
  return (
    <div 
      ref={containerRef}
      style={{ 
        width: '100%',
        overflow: 'auto',
        marginTop: '10px',
        marginBottom: '10px',
        padding: '10px',
        backgroundColor: '#fff',
        borderRadius: '6px',
        border: '1px solid #e8e8e8',
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export default Mermaid;
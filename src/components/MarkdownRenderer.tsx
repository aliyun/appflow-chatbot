/**
 * MarkdownRenderer - SDK封装的Markdown渲染组件
 * 内部复用 MarkdownView，提供简化的接口
 */

import React, { useEffect } from 'react';
import styled from 'styled-components';
import { MarkdownView } from '@/markdown';
import { loadEchartsScript } from '@/utils/loadEcharts';

export interface MarkdownRendererProps {
  /** Markdown内容 */
  content: string;
  /** 渲染状态，Running时显示加载动画 */
  status?: 'Running' | 'Success' | 'Error';
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

// 样式隔离容器
const StyledContainer = styled.div`
  /* 样式隔离 - 确保内部样式不受外部影响 */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  
  /* 确保内部元素正常显示 */
  * {
    box-sizing: border-box;
  }

  /* Markdown内容样式 */
  p {
    margin: 0 0 8px 0;
    &:last-child {
      margin-bottom: 0;
    }
  }

  ul, ol {
    margin: 8px 0;
    padding-left: 20px;
  }

  li {
    margin: 4px 0;
  }

  code {
    background: rgba(0, 0, 0, 0.05);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 13px;
  }

  pre {
    background: #f6f8fa;
    padding: 12px;
    border-radius: 6px;
    overflow-x: auto;
    
    code {
      background: transparent;
      padding: 0;
    }
  }

  blockquote {
    margin: 8px 0;
    padding: 8px 16px;
    border-left: 4px solid #ddd;
    background: #f9f9f9;
    color: #666;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin: 8px 0;
    
    th, td {
      border: 1px solid #ddd;
      padding: 8px 12px;
      text-align: left;
    }
    
    th {
      background: #f6f8fa;
      font-weight: 600;
    }
    
    tr:nth-child(even) {
      background: #f9f9f9;
    }
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
  }

  a {
    color: #1890ff;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 16px 0 8px 0;
    font-weight: 600;
    line-height: 1.4;
    
    &:first-child {
      margin-top: 0;
    }
  }

  h1 { font-size: 24px; }
  h2 { font-size: 20px; }
  h3 { font-size: 18px; }
  h4 { font-size: 16px; }
  h5 { font-size: 14px; }
  h6 { font-size: 14px; color: #666; }

  hr {
    border: none;
    border-top: 1px solid #ddd;
    margin: 16px 0;
  }

  /* 深度思考样式 */
  details {
    margin: 8px 0;
    padding: 8px 12px;
    background: #f6f8fa;
    border-radius: 6px;
    
    summary {
      cursor: pointer;
      font-weight: 500;
      color: #666;
    }
    
    pre.think {
      margin: 8px 0 0 0;
      padding: 8px;
      background: #fff;
      border-radius: 4px;
      white-space: pre-wrap;
      font-size: 13px;
      color: #666;
    }
  }
`;

/**
 * MarkdownRenderer - Markdown渲染组件
 * 
 * @example
 * ```tsx
 * <MarkdownRenderer 
 *   content="# 标题\n这是正文内容，支持**加粗**和*斜体*"
 *   status="Success"
 * />
 * ```
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  status = 'Success',
  className,
  style,
}) => {
  // 自动加载ECharts（如果内容中包含echarts代码块）
  useEffect(() => {
    if (content?.includes('```echarts')) {
      loadEchartsScript().catch(console.error);
    }
  }, [content]);

  return (
    <StyledContainer className={`appflow-sdk-markdown ${className || ''}`} style={style}>
      <MarkdownView content={content} status={status} />
    </StyledContainer>
  );
};

export default MarkdownRenderer;

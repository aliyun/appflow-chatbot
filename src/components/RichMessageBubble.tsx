/**
 * RichMessageBubble - SDK封装的富文本消息气泡组件
 * 内部复用 RichBubbleContent 核心组件，提供简化的接口
 * 支持多种消息类型：markdown、rich、ant_table、code、echart、step、error
 * 包含默认的参考资料和网页搜索交互实现
 */

import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { Modal, Image, Space } from 'antd';
import { loadEchartsScript } from '../utils/loadEcharts';
import { DocReferences, DocReferenceItem } from './DocReferences';
import { WebSearchPanel } from './WebSearchPanel';
import { RichBubbleContent } from '../core';

export interface RichMessageBubbleProps {
  /** 消息内容 */
  content: string;
  /** 消息类型 */
  messageType?: 'markdown' | 'rich';
  /** 渲染状态 */
  status?: 'Running' | 'Success' | 'Error';
  /** 参考资料列表 */
  references?: DocReferenceItem[];
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 点击参考资料回调（不传则使用默认实现） */
  onReferenceClick?: (item: DocReferenceItem) => void;
  /** 点击网页搜索结果回调（不传则使用默认实现） */
  onWebSearchClick?: (items: DocReferenceItem[]) => void;
}

// 样式组件 - SDK专用样式隔离
const StyledBubble = styled.div`
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(205, 208, 220, 0.15);
  color: #333;
  word-break: break-word;
  
  /* 样式隔离 */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  
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
    p {
      display: block !important;
    }
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
    max-width: 200px;
    max-height: 150px;
    object-fit: contain;
    border-radius: 4px;
  }

  a {
    color: #1890ff;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

// 参考资料容器
const ReferencesContainer = styled.div`
  margin-top: 12px;
`;

// 图片容器样式
const StyledWrapSpace = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

/**
 * RichMessageBubble - 富文本消息气泡组件
 * 
 * @example
 * ```tsx
 * // 使用默认交互
 * <RichMessageBubble 
 *   content="# 标题\n正文内容"
 *   messageType="markdown"
 *   status="Success"
 *   references={[
 *     { title: '参考文档1', text: '文档内容...', type: 'rag' }
 *   ]}
 * />
 * 
 * // 自定义交互
 * <RichMessageBubble 
 *   content={JSON.stringify([
 *     { messageType: 'markdown', content: '# 分析结果' },
 *     { messageType: 'echart', content: JSON.stringify({ option: {...} }) }
 *   ])}
 *   messageType="rich"
 *   references={references}
 *   onReferenceClick={(item) => console.log('自定义处理', item)}
 *   onWebSearchClick={(items) => console.log('自定义处理', items)}
 * />
 * ```
 */
export const RichMessageBubble: React.FC<RichMessageBubbleProps> = ({
  content,
  messageType = 'markdown',
  status = 'Success',
  references = [],
  className,
  style,
  onReferenceClick,
  onWebSearchClick,
}) => {
  const [modal, contextHolder] = Modal.useModal();
  
  // 网页搜索抽屉状态
  const [webSearchOpen, setWebSearchOpen] = useState(false);
  const [webSearchItems, setWebSearchItems] = useState<DocReferenceItem[]>([]);

  // 自动加载ECharts
  useEffect(() => {
    if (content?.includes('echart') || content?.includes('echarts')) {
      loadEchartsScript().catch(console.error);
    }
  }, [content]);

  // 默认的参考资料点击处理
  const defaultReferenceClick = useCallback((item: DocReferenceItem) => {
    const title = item.Title || item.title;
    const text = item.Text || item.text;
    const images = item.Images || item.images;

    modal.confirm({
      bodyStyle: { maxHeight: '80vh', overflow: 'auto' },
      icon: null,
      title: '参考资料',
      destroyOnClose: true,
      maskClosable: true,
      closable: true,
      width: 800,
      content: (
        <Space direction='vertical' style={{ width: '100%' }}>
          <div style={{ borderRadius: '4px', backgroundColor: '#f0f2f5', padding: '8px' }}>
            {title && <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{title}</div>}
            {text && <div>{text}</div>}
          </div>
          {images && images.length > 0 && (
            <div style={{ borderRadius: '4px', backgroundColor: '#f0f2f5', padding: '8px' }}>
              <StyledWrapSpace>
                {images.map((url: string, index: number) => (
                  <Image key={index} src={url} height={50} />
                ))}
              </StyledWrapSpace>
            </div>
          )}
        </Space>
      ),
      footer: null,
    });
  }, [modal]);

  // 默认的网页搜索点击处理
  const defaultWebSearchClick = useCallback((items: DocReferenceItem[]) => {
    setWebSearchItems(items);
    setWebSearchOpen(true);
  }, []);

  // 关闭网页搜索抽屉
  const handleCloseWebSearch = useCallback(() => {
    setWebSearchOpen(false);
  }, []);

  // 优先使用用户传入的回调，否则使用默认实现
  const handleReferenceClick = onReferenceClick || defaultReferenceClick;
  const handleWebSearchClick = onWebSearchClick || defaultWebSearchClick;

  return (
    <>
      <StyledBubble 
        className={`appflow-sdk-rich-message-bubble ${className || ''}`}
        style={style}
      >
        {/* 使用核心组件渲染内容 */}
        <RichBubbleContent
          content={content}
          messageType={messageType}
          status={status}
          role="bot"
        >
          {/* 参考资料 */}
          {references && references.length > 0 && status === 'Success' && (
            <ReferencesContainer>
              <DocReferences
                items={references}
                status={status}
                onItemClick={handleReferenceClick}
                onWebSearchClick={handleWebSearchClick}
              />
            </ReferencesContainer>
          )}
        </RichBubbleContent>
        {contextHolder}
      </StyledBubble>

      {/* 默认的网页搜索抽屉（仅在用户未传入onWebSearchClick时使用） */}
      {!onWebSearchClick && (
        <WebSearchPanel
          items={webSearchItems}
          open={webSearchOpen}
          onClose={handleCloseWebSearch}
        />
      )}
    </>
  );
};

export default RichMessageBubble;
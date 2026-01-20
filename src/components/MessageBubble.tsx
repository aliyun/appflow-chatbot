/**
 * MessageBubble - SDK封装的消息气泡组件
 * 内部复用 BubbleContent 核心组件，提供简化的接口
 * 包含默认的参考资料和网页搜索交互实现
 */

import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { Modal, Image, Space } from 'antd';
import { loadEchartsScript } from '@/utils/loadEcharts';
import { DocReferences, DocReferenceItem } from './DocReferences';
import { WebSearchPanel } from './WebSearchPanel';
import { HumanVerify, HistoryCard, CustomParamSchema } from './HumanVerify';
import { BubbleContent } from '@/core';

/** HumanVerify 提交数据类型 */
export interface HumanVerifySubmitData {
  verifyId: string;
  sessionWebhook: string;
  status: string;
  customParamsKey: string;
  customParamsValue: Record<string, any>;
}

/** HumanVerify 相关数据 */
export interface HumanVerifyData {
  verifyId?: string;
  sessionWebhook?: string;
  approved?: boolean;
  customParams?: CustomParamSchema;
  customParamsKey?: string;
}

/** HistoryCard 相关数据 */
export interface HistoryCardData {
  approvalStatus?: string;
  formValues?: Record<string, any>;
  formSchema?: CustomParamSchema;
}

export interface MessageBubbleProps {
  /** 消息内容（Markdown格式） */
  content: string;
  /** 消息角色 */
  role?: 'user' | 'bot';
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
  
  // ==================== HumanVerify相关Props ====================
  
  /** 事件类型（用于特殊消息如 humanVerify、historyCard） */
  eventType?: 'humanVerify' | 'historyCard';
  /** HumanVerify 相关数据 */
  humanVerifyData?: HumanVerifyData;
  /** HistoryCard 相关数据（历史对话中的审核卡片） */
  historyCardData?: HistoryCardData;
  /** HumanVerify 提交回调 */
  onHumanVerifySubmit?: (data: HumanVerifySubmitData) => void;
}

// 样式隔离容器
const StyledContainer = styled.div<{ $role: 'user' | 'bot' }>`
  display: flex;
  flex-direction: column;
  max-width: ${props => props.$role === 'user' ? '80%' : '100%'};
  align-self: ${props => props.$role === 'user' ? 'flex-end' : 'flex-start'};
`;

// 消息气泡样式
const StyledBubble = styled.div<{ $role: 'user' | 'bot' }>`
  padding: 12px 16px;
  border-radius: 12px;
  background: ${props => props.$role === 'user' 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    : 'rgba(205, 208, 220, 0.15)'};
  color: ${props => props.$role === 'user' ? '#fff' : '#333'};
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
    background: ${props => props.$role === 'user' 
      ? 'rgba(255, 255, 255, 0.2)' 
      : 'rgba(0, 0, 0, 0.05)'};
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 13px;
  }

  pre {
    background: ${props => props.$role === 'user' 
      ? 'rgba(0, 0, 0, 0.2)' 
      : '#f6f8fa'};
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
    border-left: 4px solid ${props => props.$role === 'user' 
      ? 'rgba(255, 255, 255, 0.5)' 
      : '#ddd'};
    background: ${props => props.$role === 'user' 
      ? 'rgba(0, 0, 0, 0.1)' 
      : '#f9f9f9'};
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin: 8px 0;
    
    th, td {
      border: 1px solid ${props => props.$role === 'user' 
        ? 'rgba(255, 255, 255, 0.3)' 
        : '#ddd'};
      padding: 8px 12px;
      text-align: left;
    }
    
    th {
      background: ${props => props.$role === 'user' 
        ? 'rgba(0, 0, 0, 0.1)' 
        : '#f6f8fa'};
      font-weight: 600;
    }
  }

  img {
    max-width: 200px;
    max-height: 150px;
    object-fit: contain;
    border-radius: 4px;
  }

  a {
    color: ${props => props.$role === 'user' ? '#fff' : '#1890ff'};
    text-decoration: underline;
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 16px 0 8px 0;
    font-weight: 600;
    line-height: 1.4;
    
    &:first-child {
      margin-top: 0;
    }
  }

  /* 深度思考样式 */
  details {
    margin: 8px 0;
    padding: 8px 12px;
    background: ${props => props.$role === 'user' 
      ? 'rgba(0, 0, 0, 0.1)' 
      : '#f6f8fa'};
    border-radius: 6px;
    
    summary {
      cursor: pointer;
      font-weight: 500;
    }
    
    pre.think {
      margin: 8px 0 0 0;
      padding: 8px;
      background: ${props => props.$role === 'user' 
        ? 'rgba(0, 0, 0, 0.1)' 
        : '#fff'};
      border-radius: 4px;
      white-space: pre-wrap;
      font-size: 13px;
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
 * MessageBubble - 消息气泡组件
 * 
 * @example
 * ```tsx
 * 使用默认交互
 * <MessageBubble 
 *   content="这是AI的回复，支持**Markdown**格式"
 *   role="bot"
 *   status="Success"
 *   references={[
 *     { title: '参考文档1', text: '文档内容...', type: 'rag' }
 *   ]}
 * />
 * 
 * // 自定义交互
 * <MessageBubble 
 *   content="这是AI的回复"
 *   references={references}
 *   onReferenceClick={(item) => console.log('自定义处理', item)}
 *   onWebSearchClick={(items) => console.log('自定义处理', items)}
 * />
 * ```
 */
export const MessageBubble: React.FC<MessageBubbleProps> = ({
  content,
  role = 'bot',
  status = 'Success',
  references = [],
  className,
  style,
  onReferenceClick,
  onWebSearchClick,
  // HumanVerify 相关 props
  eventType,
  humanVerifyData,
  historyCardData,
  onHumanVerifySubmit,
}) => {
  const [modal, contextHolder] = Modal.useModal();
  
  // 网页搜索抽屉状态
  const [webSearchOpen, setWebSearchOpen] = useState(false);
  const [webSearchItems, setWebSearchItems] = useState<DocReferenceItem[]>([]);

  // 自动加载ECharts（如果内容中包含echarts代码块）
  useEffect(() => {
    if (content?.includes('```echarts')) {
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
                {images.map((url, index) => (
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
      <StyledContainer 
        $role={role} 
        className={`appflow-sdk-message-bubble ${className || ''}`} 
        style={style}
      >
        <StyledBubble $role={role}>
          {/* 使用核心组件渲染内容 */}
          <BubbleContent 
            content={content} 
            status={status} 
            role={role}
          >
            {/* HumanVerify事件 - 人工审核表单 */}
            {eventType === 'humanVerify' && humanVerifyData && (
              <HumanVerify 
                verifyId={humanVerifyData.verifyId}
                sessionWebhook={humanVerifyData.sessionWebhook}
                approved={humanVerifyData.approved}
                customParamsSchema={humanVerifyData.customParams}
                customParamsKey={humanVerifyData.customParamsKey}
                onSubmit={onHumanVerifySubmit}
              />
            )}
            
            {/* HistoryCard 事件 - 历史对话中的审核卡片 */}
            {eventType === 'historyCard' && historyCardData && (
              <HistoryCard 
                approvalStatus={historyCardData.approvalStatus}
                formValues={historyCardData.formValues}
                formSchema={historyCardData.formSchema}
              />
            )}
            
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
          </BubbleContent>
          {contextHolder}
        </StyledBubble>
      </StyledContainer>

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

export default MessageBubble;
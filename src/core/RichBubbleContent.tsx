/**
 * RichBubbleContent - 富文本消息气泡核心展示组件
 * 纯展示组件，不包含业务逻辑（如 Modal、bot 上下文等）
 * 
 * 支持的消息类型：
 * - markdown: Markdown格式文本
 * - rich: 包含多种类型的复合消息
 * - ant_table: Ant Design表格数据
 * - code: 代码块
 * - echart: ECharts图表
 * - step: 步骤折叠面板
 * - error: 错误信息
 * 
 */

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Collapse } from 'antd';
import { MarkdownView } from '../markdown';
import { convertTableDataToMarkdown, processStepContent } from '../markdown/utils/dataProcessor';
import { RichBubbleProvider } from '../context/RichBubble';

export interface RichBubbleContentProps {
  /** 消息内容 */
  content: string;
  /** 消息类型 */
  messageType?: 'markdown' | 'rich';
  /** 渲染状态 */
  status?: 'Running' | 'Success' | 'Error';
  /** 消息角色 */
  role?: 'user' | 'bot';
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 子元素（如参考资料组件） */
  children?: React.ReactNode;
  /** 等待消息文本，由外层传入 */
  waitingMessage?: string;
}

// Markdown 内容容器样式
const StyledMarkdownView = styled.div<{ $role: string }>`
  white-space: normal;
  li {
    p {
      display: block !important;
    }
  }
`;

// 步骤样式
const StyledStepTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StyledStatusIcon = styled.span<{ $success: boolean }>`
  color: ${props => props.$success ? '#52c41a' : '#1890ff'};
  font-weight: bold;
`;

const StyledStepNumber = styled.span`
  color: #666;
  font-weight: 500;
`;

const StyledStepText = styled.span`
  color: #333;
`;

const StyledStepContent = styled.div`
  padding: 8px 0;
`;

/**
 * RichBubbleContent - 富文本消息气泡核心展示组件
 * 
 * @example
 * ```tsx
 * // Markdown类型
 * <RichBubbleContent 
 *   content="# 标题\n正文内容"
 *   messageType="markdown"
 *   status="Success"
 * />
 * 
 * // Rich类型（包含多种内容）
 * <RichBubbleContent 
 *   content={JSON.stringify([
 *     { messageType: 'markdown', content: '# 分析结果' },
 *     { messageType: 'ant_table', content: JSON.stringify({ column: ['A', 'B'], data: [{A: 1, B: 2}] }) },
 *     { messageType: 'echart', content: JSON.stringify({ option: {...} }) }
 *   ])}
 *   messageType="rich"
 *   status="Success"
 * >
 *   <DocReferences items={references} />
 * </RichBubbleContent>
 * ```
 */
export const RichBubbleContent: React.FC<RichBubbleContentProps> = ({
  content,
  messageType = 'markdown',
  status = 'Success',
  role = 'bot',
  className,
  style,
  children,
  waitingMessage,
}) => {
  // step消息折叠面板激活的索引
  const [activeKey, setActiveKey] = useState<string | string[]>([]);

  // 初始化step消息折叠面板激活的索引
  useEffect(() => {
    if (messageType === 'rich') {
      try {
        const richContent = JSON.parse(content);
        if (Array.isArray(richContent)) {
          const newActiveKeys = richContent
            .filter(item => item?.messageType === 'step' && item?.content)
            .map(item => {
              try {
                const itemContent = JSON.parse(item?.content);
                return itemContent?.id;
              } catch {
                return null;
              }
            })
            .filter(Boolean);
          
          // 只有当有新的keys时才更新，避免无限循环
          if (newActiveKeys.length > 0) {
            setActiveKey(newActiveKeys);
          }
        }
      } catch (error) {
        console.error('解析rich类型消息失败', error);
      }
    }
  }, [content, messageType]);

  // 渲染步骤内容
  const renderStepContent = (detail: any, type: string): React.ReactNode => {
    if (type === 'rich') {
      // 递归调用renderContent处理rich类型
      return renderContent(type, detail);
    } else {
      const contentToRender = detail || '';
      if (!contentToRender) {
        return <StyledStepContent>暂无内容</StyledStepContent>;
      }

      return (
        <StyledStepContent>
          <MarkdownView content={processStepContent(detail, type)} waitingMessage={waitingMessage} />
        </StyledStepContent>
      );
    }
  };

  // 渲染内容
  const renderContent = (msgType: string, text: string): React.ReactNode => {
    if (msgType === 'markdown' && text) {
      return (
        <MarkdownView 
          content={text} 
          status={status}
          waitingMessage={waitingMessage}
        />
      );
    }

    if (msgType === 'rich') {
      try {
        const richContent = JSON.parse(text);
        if (!richContent || !Array.isArray(richContent)) {
          return null;
        }

        return richContent?.map((item, index) => {
          const itemMessageType = item?.messageType;
          
          // markdown类型
          if (itemMessageType === 'markdown' && item?.content) {
            return (
              <MarkdownView 
                key={`markdown-${index}`}
                content={item?.content} 
                status={status}
                waitingMessage={waitingMessage}
              />
            );
          }

          // ant_table类型
          if (itemMessageType === 'ant_table' && item?.content) {
            try {
              const parsedContent = JSON.parse(item?.content);
              const antTableContent = convertTableDataToMarkdown(parsedContent);
              return (
                <MarkdownView 
                  key={`table-${index}`}
                  content={antTableContent} 
                  status={status}
                  waitingMessage={waitingMessage}
                />
              );
            } catch {
              return null;
            }
          }

          // code类型
          if (itemMessageType === 'code' && item?.content) {
            const codeContent = '```sql\n' + item?.content + '\n```';
            return (
              <MarkdownView 
                key={`code-${index}`}
                content={codeContent} 
                status={status}
                waitingMessage={waitingMessage}
              />
            );
          }

          // echart类型
          if (itemMessageType === 'echart') {
            const echartContent = '```echarts\n' + item?.content + '\n```';
            return (
              <MarkdownView 
                key={`echart-${index}`}
                content={echartContent} 
                status={status}
                waitingMessage={waitingMessage}
              />
            );
          }

          // step类型
          if (itemMessageType === 'step') {
            try {
              const itemContent = JSON.parse(item?.content);
              const collapseItems = [{
                key: itemContent?.id,
                label: (
                  <StyledStepTitleWrapper>
                    <StyledStatusIcon $success={status === 'Success'}>
                      {status === 'Success' ? '✓' : '⟳'}
                    </StyledStatusIcon>
                    <StyledStepNumber>步骤{index + 1}:</StyledStepNumber>
                    <StyledStepText>{itemContent?.title}</StyledStepText>
                  </StyledStepTitleWrapper>
                ),
                children: renderStepContent(itemContent?.detail, itemContent?.messageType),
                style: {
                  marginBottom: '8px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e8e8e8'
                }
              }];
              
              return (
                <Collapse
                  key={`step-${index}`}
                  activeKey={activeKey}
                  size="small"
                  ghost={false}
                  items={collapseItems}
                  expandIconPosition="end"
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none'
                  }}
                  onChange={(keys) => {
                    setActiveKey(keys);
                  }}
                />
              );
            } catch {
              return null;
            }
          }

          // error类型
          if (itemMessageType === 'error') {
            const errorContent = `<span style="color:red">${item?.content ?? ''}</span>`;
            return (
              <MarkdownView 
                key={`error-${index}`}
                content={errorContent}
                status={status}
                waitingMessage={waitingMessage}
              />
            );
          }

          return null;
        });
      } catch (error) {
        console.error('Error rendering message:', error);
        return null;
      }
    }

    return null;
  };

  return (
    <RichBubbleProvider value={{ activeKey }}>
      <div className={className} style={style}>
        <StyledMarkdownView $role={role}>
          {renderContent(messageType, content)}
        </StyledMarkdownView>
        {children}
      </div>
    </RichBubbleProvider>
  );
};

export default RichBubbleContent;

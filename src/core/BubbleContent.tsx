/**
 * BubbleContent - 消息气泡核心展示组件
 */

import React from 'react';
import styled from 'styled-components';
import { MarkdownView } from '../markdown';

export interface BubbleContentProps {
  /** 消息内容（Markdown格式） */
  content: string;
  /** 渲染状态 */
  status?: 'Running' | 'Success' | 'Error';
  /** 消息角色 */
  role?: 'user' | 'bot';
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 自定义气泡样式（用于业务组件传入） */
  bubbleStyle?: React.CSSProperties;
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

/**
 * BubbleContent - 消息气泡核心展示组件
 * 
 * @example
 * ```tsx
 * <BubbleContent 
 *   content="这是消息内容，支持**Markdown**"
 *   status="Success"
 *   role="bot"
 * >
 *   <ChatBotSource items={references} />
 * </BubbleContent>
 * ```
 */
export const BubbleContent: React.FC<BubbleContentProps> = ({
  content,
  status = 'Success',
  role = 'bot',
  className,
  style,
  children,
  waitingMessage,
}) => {
  return (
    <div className={className} style={style}>
      <StyledMarkdownView $role={role}>
        <MarkdownView 
          content={content} 
          status={status}
          waitingMessage={waitingMessage}
        />
      </StyledMarkdownView>
      {children}
    </div>
  );
};

export default BubbleContent;

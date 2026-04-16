/**
 * A2UISurface - A2UI 声明式 UI 渲染组件
 * 
 * 基于 Google A2UI 协议，将 Agent 生成的声明式 JSON 消息
 * 渲染为原生 React 组件。支持流式增量更新和自定义组件注册。
 * 
 */

import React, { useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import {
  A2UIProvider,
  A2UIRenderer,
  A2UIViewer,
  useA2UI,
  initializeDefaultCatalog,
  ComponentRegistry,
} from '@a2ui/react';
import type {
  ServerToClientMessage,
  OnActionCallback,
  A2UIViewerProps,
} from '@a2ui/react';

// 初始化默认组件目录（全局只需执行一次）
initializeDefaultCatalog();

// ==================== Types ====================

/** A2UI 协议消息（v0.8 格式，透传给 @a2ui/react 处理） */
export type A2UIMessage = ServerToClientMessage;

export interface A2UISurfaceProps {
  /** A2UI JSON 消息数组（来自 Agent 的响应） */
  messages: A2UIMessage[];
  /** 渲染的 Surface ID（默认 'main'） */
  surfaceId?: string;
  /** 用户在 A2UI 组件上的交互回调 */
  onAction?: OnActionCallback;
  /** 自定义组件注册表（可选，默认使用内置组件） */
  registry?: ComponentRegistry;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/** A2UIViewer 的 Props，用于静态 JSON 渲染场景 */
export type A2UIStaticViewerProps = A2UIViewerProps;

// ==================== Styled Components ====================

const A2UIContainer = styled.div`
  margin-top: 12px;
  width: 100%;
  max-width: 100%;
`;

// ==================== Internal Component ====================

/**
 * 内部组件：负责消息处理和 Surface 渲染
 * 必须在 A2UIProvider 内部使用，以获取 useA2UI hook 的上下文
 */
const A2UISurfaceInner: React.FC<{
  messages: A2UIMessage[];
  surfaceId: string;
  registry?: ComponentRegistry;
  className?: string;
  style?: React.CSSProperties;
}> = ({ messages, surfaceId, registry, className, style }) => {
  const { processMessages, getSurface } = useA2UI();
  const processedCountRef = useRef(0);

  // 增量处理新到达的消息（支持流式场景）
  useEffect(() => {
    if (messages.length > processedCountRef.current) {
      const newMessages = messages.slice(processedCountRef.current);
      processMessages(newMessages);
      processedCountRef.current = messages.length;
    }
  }, [messages, processMessages]);

  // 当消息被清空时重置计数器
  useEffect(() => {
    if (messages.length === 0) {
      processedCountRef.current = 0;
    }
  }, [messages.length]);

  const surface = getSurface(surfaceId);

  if (!surface) {
    return null;
  }

  return (
    <A2UIContainer className={className} style={style}>
      <A2UIRenderer
        surfaceId={surfaceId}
        registry={registry}
      />
    </A2UIContainer>
  );
};

// ==================== Exported Components ====================

/**
 * A2UISurface - A2UI 声明式 UI 渲染组件（流式消息场景）
 * 
 * 接收 Agent 发送的 A2UI 协议消息数组，增量处理并渲染对应的 Surface。
 * 内部封装了 A2UIProvider，可直接作为 BubbleContent 的 children 使用。
 * 
 * @example
 * ```tsx
 * // 作为 BubbleContent 的 children 使用
 * <BubbleContent content={content} status={status}>
 *   <A2UISurface 
 *     messages={a2uiMessages} 
 *     surfaceId="main"
 *     onAction={(msg) => console.log('用户操作:', msg)} 
 *   />
 * </BubbleContent>
 * ```
 */
export const A2UISurface: React.FC<A2UISurfaceProps> = ({
  messages,
  surfaceId = 'main',
  onAction,
  registry,
  className,
  style,
}) => {
  const handleAction: OnActionCallback = useCallback((message) => {
    onAction?.(message);
  }, [onAction]);

  return (
    <A2UIProvider onAction={handleAction}>
      <A2UISurfaceInner
        messages={messages}
        surfaceId={surfaceId}
        registry={registry}
        className={className}
        style={style}
      />
    </A2UIProvider>
  );
};

/**
 * A2UIStaticViewer - A2UI 静态 JSON 渲染组件
 * 
 * 用于直接从静态的组件定义和数据渲染 UI，无需流式消息。
 * 适用于已有完整 A2UI 组件树的场景。
 * 
 * @example
 * ```tsx
 * const components = [
 *   { id: 'root', component: { Card: { child: 'text' } } },
 *   { id: 'text', component: { Text: { text: { path: '/message' } } } },
 * ];
 * 
 * <A2UIStaticViewer
 *   root="root"
 *   components={components}
 *   data={{ message: 'Hello World!' }}
 *   onAction={(action) => console.log('Action:', action)}
 * />
 * ```
 */
export const A2UIStaticViewer: React.FC<A2UIStaticViewerProps> = (props) => {
  return (
    <A2UIContainer>
      <A2UIViewer {...props} />
    </A2UIContainer>
  );
};

export default A2UISurface;

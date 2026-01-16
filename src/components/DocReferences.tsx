/**
 * DocReferences - SDK封装的参考资料组件
 * 内部复用 SourceContent 核心组件，提供简化的接口
 */

import React from 'react';
import { SourceContent, SourceItem } from '../core';

// 重新导出类型，保持向后兼容
export type DocReferenceItem = SourceItem;

export interface DocReferencesProps {
  /** 参考资料列表 */
  items: DocReferenceItem[];
  /** 渲染状态 */
  status?: 'Running' | 'Success' | 'Error';
  /** 点击参考资料回调 */
  onItemClick?: (item: DocReferenceItem) => void;
  /** 点击网页搜索结果回调 */
  onWebSearchClick?: (items: DocReferenceItem[]) => void;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/**
 * DocReferences - 参考资料组件
 * 
 * @example
 * ```tsx
 * <DocReferences 
 *   items={[
 *     { title: '参考文档1', text: '内容...', index: '1', type: 'rag' },
 *     { title: '搜索结果1', url: 'https://...', type: 'web_search' }
 *   ]}
 *   status="Success"
 *   onItemClick={(item) => console.log('点击了', item)}
 *   onWebSearchClick={(items) => console.log('网页搜索', items)}
 * />
 * ```
 */
export const DocReferences: React.FC<DocReferencesProps> = ({
  items,
  status = 'Success',
  onItemClick,
  onWebSearchClick,
  className,
  style,
}) => {
  return (
    <SourceContent
      className={`appflow-sdk-doc-references ${className || ''}`}
      style={style}
      items={items}
      status={status}
      isPageConfig={false}
      onItemClick={onItemClick}
      onWebSearchClick={onWebSearchClick}
    />
  );
};

export default DocReferences;

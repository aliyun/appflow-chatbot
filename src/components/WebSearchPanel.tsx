/**
 * WebSearchPanel - SDK封装的网页搜索结果组件
 * 内部复用 WebSearchContent 核心组件，提供简化的接口
 */

import React from 'react';
import { WebSearchContent, WebSearchItem } from '../core';

// 重新导出类型，保持向后兼容
export type { WebSearchItem };

export interface WebSearchPanelProps {
  /** 搜索结果列表 */
  items: WebSearchItem[];
  /** 是否显示 */
  open: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 面板宽度 */
  width?: number | string;
  /** 挂载容器 */
  getContainer?: () => HTMLElement;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/**
 * WebSearchPanel - 网页搜索结果面板组件
 * 
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 * const [searchResults, setSearchResults] = useState([]);
 * 
 * <WebSearchPanel 
 *   items={searchResults}
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   width={400}
 * />
 * ```
 */
export const WebSearchPanel: React.FC<WebSearchPanelProps> = ({
  items,
  open,
  onClose,
  width = 400,
  getContainer,
  className,
  style,
}) => {
  return (
    <WebSearchContent
      className={`appflow-sdk-web-search-panel ${className || ''}`}
      style={style}
      items={items}
      open={open}
      onClose={onClose}
      isPageConfig={false}
      width={width}
      getContainer={getContainer}
    />
  );
};

export default WebSearchPanel;

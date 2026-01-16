/**
 * RichBubble 上下文
 * 用于在 RichBubbleContent 和子组件（如 ECharts）之间共享折叠面板状态
 */

import { createContext, useContext } from 'react';

export interface RichBubbleContextValue {
  /** 当前激活的折叠面板 key */
  activeKey: string | string[];
}

const RichBubbleContext = createContext<RichBubbleContextValue>({
  activeKey: [],
});

export const RichBubbleProvider = RichBubbleContext.Provider;

export const useRichBubbleContext = () => useContext(RichBubbleContext);

export default RichBubbleContext;

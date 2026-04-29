/**
 * Locale Context 与 Provider
 */

import React, { createContext, useEffect, useMemo } from 'react';
import zhCN from '../locales/zh-CN';
import type { DeepPartial, Locale } from '../locales/types';
import { setGlobalLocale } from './translate';
import { deepMerge } from './utils';

export interface LocaleContextValue {
  locale: Locale;
  localeName: string;
}

export const LocaleContext = createContext<LocaleContextValue>({
  locale: zhCN as unknown as Locale,
  localeName: 'zh-CN',
});

export interface LocaleProviderProps {
  /** 完整 locale 对象，默认使用内置 zhCN */
  locale?: Locale;
  /** 语言标识，如 'zh-CN' / 'en-US' */
  localeName?: string;
  /** 部分覆盖：在选定 locale 基础上 deep merge 自定义文案 */
  overrides?: DeepPartial<Locale>;
  children: React.ReactNode;
}

/**
 * LocaleProvider
 *
 * 用法示例：
 * ```tsx
 * import { LocaleProvider, enUS } from '@alicloud/appflow-chat';
 *
 * <LocaleProvider locale={enUS} localeName="en-US">
 *   <App />
 * </LocaleProvider>
 * ```
 */
export const LocaleProvider: React.FC<LocaleProviderProps> = ({
  locale,
  localeName = 'zh-CN',
  overrides,
  children,
}) => {
  const baseLocale = (locale ?? (zhCN as unknown as Locale)) as Locale;

  const mergedLocale = useMemo<Locale>(() => {
    if (!overrides) return baseLocale;
    return deepMerge(
      baseLocale as unknown as Record<string, unknown>,
      overrides as Record<string, unknown>
    ) as unknown as Locale;
  }, [baseLocale, overrides]);

  // 同步到全局，供非 React 场景（如 ChatService）使用
  useEffect(() => {
    setGlobalLocale(mergedLocale, localeName);
  }, [mergedLocale, localeName]);

  const contextValue = useMemo<LocaleContextValue>(
    () => ({ locale: mergedLocale, localeName }),
    [mergedLocale, localeName]
  );

  return <LocaleContext.Provider value={contextValue}>{children}</LocaleContext.Provider>;
};

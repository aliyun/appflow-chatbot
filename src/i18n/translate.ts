/**
 * 全局 translate 函数
 *
 * 用于非 React 组件场景（如 ChatService、工具函数）。
 * 在 LocaleProvider 挂载/更新时会自动同步全局 locale。
 */

import zhCN from '../locales/zh-CN';
import type { Locale, TranslationKey, TranslationParams } from '../locales/types';
import { getByPath, interpolate } from './utils';

let globalLocale: Locale = zhCN as unknown as Locale;
let globalLocaleName = 'zh-CN';

/** 设置全局 locale，由 LocaleProvider 在挂载/更新时调用 */
export function setGlobalLocale(locale: Locale, localeName?: string): void {
  globalLocale = locale;
  if (localeName) globalLocaleName = localeName;
}

/** 获取当前全局 locale */
export function getGlobalLocale(): Locale {
  return globalLocale;
}

/** 获取当前全局 locale 名称 */
export function getGlobalLocaleName(): string {
  return globalLocaleName;
}

/**
 * 全局翻译函数（非 Hook 版本）
 *
 * @example
 *   translate('common.loading') // '加载中...'
 *   translate('humanVerify.placeholder.input', { title: '名称' }) // '请输入名称'
 */
export function translate(key: TranslationKey, params?: TranslationParams): string {
  const value = getByPath(globalLocale, key);
  if (typeof value !== 'string') return key;
  return params ? interpolate(value, params) : value;
}

/**
 * i18n 工具函数：插值、路径取值、深度合并
 */

import type { TranslationParams } from '../locales/types';

/**
 * 字符串插值
 * @example
 *   interpolate('请输入{title}', { title: '名称' }) // '请输入名称'
 */
export function interpolate(template: string, params: TranslationParams): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key];
    return value === undefined || value === null ? `{${key}}` : String(value);
  });
}

/**
 * 按点分路径从对象中取值
 * @example
 *   getByPath({ a: { b: 1 } }, 'a.b') // 1
 */
export function getByPath(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== 'object') return undefined;
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/**
 * 深度合并两个对象（不修改原对象）
 * 仅合并普通对象，数组和其他类型直接覆盖。
 */
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Record<string, unknown> | undefined
): T {
  if (!source) return target;

  const result: Record<string, unknown> = { ...target };

  for (const key of Object.keys(source)) {
    const sourceValue = source[key];
    const targetValue = result[key];

    if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
      result[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      );
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue;
    }
  }

  return result as T;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

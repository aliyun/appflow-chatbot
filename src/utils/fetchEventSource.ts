/**
 * fetchEventSource CDN 加载封装模块
 */

let fetchEventSourceFn: any = null;
let loadPromise: Promise<any> | null = null;

const CDN_URL = 'https://g.alicdn.com/code/npm/@ali/chatui-sdk/6.6.5/ChatSSE.js';

/**
 * 动态加载 ChatSSE CDN 脚本
 */
function loadChatSSEScript(): Promise<any> {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    // 检查是否已加载
    if ((window as any).ChatSSE?.fetchEventSource) {
      fetchEventSourceFn = (window as any).ChatSSE.fetchEventSource;
      resolve(fetchEventSourceFn);
      return;
    }

    const script = document.createElement('script');
    script.src = CDN_URL;
    script.async = true;

    script.onload = () => {
      fetchEventSourceFn = (window as any).ChatSSE?.fetchEventSource;
      if (fetchEventSourceFn) {
        resolve(fetchEventSourceFn);
      } else {
        reject(new Error('ChatSSE.fetchEventSource not found after script load'));
      }
    };

    script.onerror = () => {
      loadPromise = null; // 重置以便重试
      reject(new Error('Failed to load ChatSSE script from CDN'));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

/**
 * 获取 fetchEventSource 函数
 */
export async function getFetchEventSource(): Promise<any> {
  if (fetchEventSourceFn) return fetchEventSourceFn;
  return loadChatSSEScript();
}

/**
 * fetchEventSource 包装函数
 * 与原 @ali/chatui-sdk 的 fetchEventSource 接口保持一致
 */
export async function fetchEventSource(url: string, options: any): Promise<void> {
  const fn = await getFetchEventSource();
  return fn(url, options);
}

export default fetchEventSource;
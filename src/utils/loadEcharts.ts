import { addExternalScript, checkScriptAccessible } from "./common";

/**
 * ECharts 按需加载函数
 * 用于在需要渲染图表时动态加载 ECharts 库
 */
export const loadEchartsScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 检查echarts是否已经加载
    if (typeof window !== 'undefined' && (window as any).echarts) {
      resolve();
      return;
    }
    // 异步函数来处理CDN检查和脚本加载
    const loadScript = async () => {
      // 默认地址
      let echartsScript = 'https://cdnjs.cloudflare.com/ajax/libs/echarts/5.4.2/echarts.min.js';
      // 阿里云cdn地址
      const aliCdnUrl = 'https://o.alicdn.com/appflow/chatbot/v1/echarts.min.js';
      try {
        // 检查阿里云CDN是否可访问
        const isAliCdnAccessible = await checkScriptAccessible(aliCdnUrl);
        if (isAliCdnAccessible) {
          echartsScript = aliCdnUrl;
        }
      } catch (error) {
        console.warn('检查阿里云CDN可访问性失败，使用默认CDN:', error);
      }
      // 动态加载echarts
      addExternalScript(echartsScript)
        .then(() => { resolve() })
        .catch((error) => {
          console.error('echarts加载失败:', error);
          reject(error);
        });
    };
    // 执行异步加载
    loadScript().catch(reject);
  });
};

export default loadEchartsScript;

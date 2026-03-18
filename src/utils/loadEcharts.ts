import { addExternalScript } from "./common";

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

    // CDN地址
    const echartsScript = 'https://cdnjs.cloudflare.com/ajax/libs/echarts/5.4.2/echarts.min.js';

    addExternalScript(echartsScript)
      .then(() => resolve())
      .catch((error) => {
        console.error('echarts加载失败:', error);
        reject(error);
      });
  });
};

export default loadEchartsScript;

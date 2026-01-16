/**
 * ECharts 按需加载函数
 * 用于在需要渲染图表时动态加载 ECharts 库
 */

export const loadEchartsScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 检查 echarts 是否已经加载
    if (typeof window !== 'undefined' && (window as any).echarts) {
      resolve();
      return;
    }

    // 动态加载 echarts
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/echarts/5.4.2/echarts.min.js';
    script.async = true;

    script.onload = () => {
      resolve();
    };

    script.onerror = (error) => {
      console.error('ECharts 加载失败:', error);
      reject(new Error('Failed to load ECharts'));
    };

    document.head.appendChild(script);
  });
};

export default loadEchartsScript;

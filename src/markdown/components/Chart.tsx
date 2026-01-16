
import React, { useEffect, useRef, useState } from 'react';
import { useRichBubbleContext } from '@/context/RichBubble';
import loadEchartsScript from '@/utils/loadEcharts';

interface Iprops {
  options: any;
}

export const Chart: React.FC<Iprops> = ({
  options,
}) => {
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [isEchartsLoaded, setIsEchartsLoaded] = useState(false);

  const { activeKey } = useRichBubbleContext();

  // 加载echarts
  useEffect(() => {
    const initEcharts = async () => {
      try {
        await loadEchartsScript();
        setIsEchartsLoaded(true);
      } catch (error) {
        console.error('echarts加载失败:', error);
        setIsEchartsLoaded(false);
      }
    };

    initEcharts();
  }, []);

  useEffect(() => {
    // 确保echarts已加载且DOM元素存在
    if (!isEchartsLoaded || !chartContainerRef.current || !options) return;

    const echarts = (window as any).echarts;
    if (!echarts) {
      console.error('echarts未正确加载');
      return;
    }

    // 清理之前的实例
    if (chartInstanceRef.current) {
      // @ts-ignore
      chartInstanceRef.current.dispose();
    }

    // 创建新的图表实例
    const chartInstance = echarts.init(chartContainerRef.current);
    // @ts-ignore
    chartInstanceRef.current = chartInstance;

    // 设置图表选项
    chartInstance.setOption(options);

    // 处理窗口大小变化
    const handleResize = () => {
      chartInstance.resize();
    };
    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.dispose();
      chartInstanceRef.current = null;
    };
  }, [options, isEchartsLoaded]);

  // 在步骤消息折叠框改变时更新图表
  useEffect(() => {
    if (chartInstanceRef.current && activeKey && isEchartsLoaded) {
      // 确保折叠动画完成后再resize
      const timer = setTimeout(() => {
        // @ts-ignore
        chartInstanceRef.current?.resize();
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [activeKey, isEchartsLoaded]);

  // 等待echarts加载完成
  if (!isEchartsLoaded) {
    return (
      <div 
        style={{ 
          width: '100%', 
          height: '400px', 
          marginTop: '20px', 
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px dashed #d9d9d9',
          borderRadius: '6px',
          color: '#666'
        }}
      >
        图表加载中...
      </div>
    );
  }

  return (
    <div 
      ref={chartContainerRef} 
      style={{ 
        width: '100%', 
        height: '400px', 
        marginTop: '20px', 
        marginBottom: '20px' 
      }} 
    />
  );
};

export default Chart;

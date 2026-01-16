import React from 'react';
import styled from 'styled-components';

// ==================== Styled Components ====================

const ChartLoadingContainer = styled.div`
  padding: 10px;
  text-align: center;
  background: #f9f9f9;
  border-radius: 4px;
  color: #666;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;

  span {
    font-size: 14px;
    line-height: 1.5;
  }

  &:hover {
    background: #f5f5f5;
  }
`;

// ==================== Component ====================

interface ChartLoadingProps {
  text?: string;
}

const ChartLoading: React.FC<ChartLoadingProps> = ({ text = '图表加载中...' }) => {
  return (
    <ChartLoadingContainer>
      <span>{text}</span>
    </ChartLoadingContainer>
  );
};

export default ChartLoading;

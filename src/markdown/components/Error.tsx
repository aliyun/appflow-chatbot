import React from 'react';
import styled from 'styled-components';

// ==================== Styled Components ====================

const ChartErrorContainer = styled.div`
  margin: 10px 0;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
  background: #ffeeee;
  color: rgb(200, 0, 0);
  border: 1px solid #ffcccc;

  span {
    font-size: 14px;
    line-height: 1.5;
  }

  &:hover {
    background: #f5f5f5;
  }
`;

// ==================== Component ====================

interface ChartErrorProps {
  text?: string;
}

const ChartError: React.FC<ChartErrorProps> = ({ text = '' }) => {
  return (
    <ChartErrorContainer>
      <span>{text}</span>
    </ChartErrorContainer>
  );
};

export default ChartError;

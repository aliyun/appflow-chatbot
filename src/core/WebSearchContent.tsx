/**
 * WebSearchContent - 网页搜索结果核心展示组件
 */

import React from 'react';
import styled from 'styled-components';
import { Drawer, List, Typography } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

const { Title } = Typography;

// 网页搜索结果项类型
export interface WebSearchItem {
  /** 标题 */
  title?: string;
  Title?: string;
  /** 内容摘要 */
  text?: string;
  Text?: string;
  /** 链接URL */
  url?: string;
  Url?: string;
}

export interface WebSearchContentProps {
  /** 搜索结果列表 */
  items?: WebSearchItem[];
  /** 是否显示 */
  open?: boolean;
  /** 关闭回调 */
  onClose?: () => void;
  /** 是否使用大写字段名（PageConfig模式） */
  isPageConfig?: boolean;
  /** 面板宽度 */
  width?: number | string;
  /** 挂载容器 */
  getContainer?: () => HTMLElement;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

// 样式组件
const StyledContainer = styled.div<{ $isMobile: boolean }>`
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  ${props => props.$isMobile && `
    padding: 16px;
  `}
`;

const StyledContent = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
`;

const StyledCloseButton = styled.div`
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  color: #666;
  font-size: 14px;
  
  &:hover {
    background: #f5f5f5;
    color: #333;
  }
`;

const StyledMeta = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

const StyledMetaIndex = styled.span`
  font-weight: 600;
  color: #333;
  min-width: 20px;
`;

const StyledMetaTitle = styled.div`
  color: #1890ff;
  cursor: pointer;
  flex: 1;
  
  &:hover {
    text-decoration: underline;
  }
`;

const StyledMetaText = styled.div`
  color: #666;
  font-size: 13px;
  cursor: pointer;
  margin-top: 4px;
  
  &:hover {
    color: #333;
  }
`;

/**
 * WebSearchContent - 网页搜索结果核心展示组件
 * 
 * @example
 * ```tsx
 * <WebSearchContent 
 *   items={[
 *     { title: '搜索结果1', text: '内容摘要...', url: 'https://...' }
 *   ]}
 *   open={true}
 *   onClose={() => setOpen(false)}
 * />
 * ```
 */
export const WebSearchContent: React.FC<WebSearchContentProps> = ({
  items = [],
  open = false,
  onClose,
  isPageConfig = false,
  width = 400,
  getContainer,
  className,
  style,
}) => {
  // 判断是否移动端
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 500;
  const panelWidth = isMobile ? '100%' : width;

  // 打开链接
  const handleOpenUrl = (item: WebSearchItem) => {
    const url = isPageConfig ? item.Url : item.url;
    if (url) {
      window.open(url, '_blank');
    }
  };

  // 关闭处理
  const handleClose = () => {
    onClose?.();
  };

  return (
    <Drawer
      className={className}
      style={style}
      placement="right"
      open={open}
      mask={false}
      width={panelWidth}
      destroyOnClose
      closable={false}
      bodyStyle={{
        boxShadow: 'none',
        outline: 'none',
        padding: '16px',
      }}
      getContainer={getContainer}
      onClose={handleClose}
    >
      <StyledContainer $isMobile={isMobile}>
        <StyledContent>
          <StyledHeader>
            <Title level={5} style={{ margin: 0 }}>搜索结果</Title>
            <StyledCloseButton onClick={handleClose}>
              <CloseOutlined />
            </StyledCloseButton>
          </StyledHeader>
          
          <List
            itemLayout="horizontal"
            dataSource={items}
            renderItem={(item, index) => {
              const title = isPageConfig ? item.Title : item.title;
              const text = isPageConfig ? item.Text : item.text;
              
              return (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <StyledMeta>
                        <StyledMetaIndex>{index + 1}.</StyledMetaIndex>
                        <StyledMetaTitle
                          onClick={() => handleOpenUrl(item)}
                          dangerouslySetInnerHTML={{ __html: title || '' }}
                        />
                      </StyledMeta>
                    }
                    description={
                      <StyledMetaText
                        onClick={() => handleOpenUrl(item)}
                        dangerouslySetInnerHTML={{ __html: text || '' }}
                      />
                    }
                  />
                </List.Item>
              );
            }}
          />
        </StyledContent>
      </StyledContainer>
    </Drawer>
  );
};

export default WebSearchContent;

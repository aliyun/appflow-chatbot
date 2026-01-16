/**
 * SourceContent - 参考资料核心展示组件
 * 
 * 支持的内容类型：
 * - rag: 知识库参考资料
 * - web_search: 网页搜索结果
 */

import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Image } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { flatten, uniq } from 'lodash-es';

// 参考资料项类型
export interface SourceItem {
  /** 标题 */
  title?: string;
  Title?: string;
  /** 内容文本 */
  text?: string;
  Text?: string;
  /** 索引序号 */
  index?: string;
  Index?: string;
  /** 类型：rag-知识库, web_search-网页搜索 */
  type?: 'rag' | 'web_search' | string;
  Type?: string;
  /** 图片列表 */
  images?: string[];
  Images?: string[];
  /** 链接URL（网页搜索结果） */
  url?: string;
  Url?: string;
  /** 文档ID */
  doc_id?: string;
  doc_name?: string;
  index_id?: string;
}

export interface SourceContentProps {
  /** 参考资料列表 */
  items: SourceItem[];
  /** 渲染状态 */
  status?: 'Running' | 'Success' | 'Error' | string;
  /** 是否使用大写字段名（PageConfig模式） */
  isPageConfig?: boolean;
  /** 点击参考资料回调 */
  onItemClick?: (item: SourceItem) => void;
  /** 点击网页搜索结果回调 */
  onWebSearchClick?: (items: SourceItem[]) => void;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

// 样式组件
const StyledSource = styled.div`
  margin-top: 16px;
  border-top: 1px solid #e8e8e8;
  padding-top: 16px;
`;

const StyledAnswerSource = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: baseline;
`;

const StyledSourceItem = styled.div`
  margin-bottom: 8px;
  cursor: pointer;
  width: 100%;
`;

const StyledSourceItemSpace = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-start;
`;

const StyledItemOrder = styled.div`
  align-items: center;
  border: 0.5px solid #2c2c73;
  border-radius: 2px;
  display: flex;
  font-size: 10px;
  height: 12px;
  justify-content: center;
  line-height: 1;
  min-width: 14px;
  white-space: nowrap;
`;

const StyledItemTitle = styled.div`
  border: 0.5px solid #9296a9;
  border-radius: 4px;
  color: #707279;
  font-size: 12px;
  height: 28px;
  line-height: 28px;
  margin: 0;
  padding: 0 8px;
  width: auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledWrapSpace = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const StyledImageBox = styled.div`
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 4px;
`;

const StyledWebSearchSource = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
  background: rgb(230, 232, 236);
  border-radius: 10px;
  width: fit-content;
  padding: 7px 14px;
  font-size: 12px;
  cursor: pointer;
  
  &:hover {
    background: rgb(220, 222, 226);
  }
`;

const StyledLabel = styled.div`
  color: #707279;
  font-size: 12px;
  min-width: 60px;
`;

// 单个参考资料项组件
interface SourceItemComponentProps {
  item: SourceItem;
  isPageConfig?: boolean;
  onClick: (item: SourceItem) => void;
}

const SourceItemComponent: React.FC<SourceItemComponentProps> = ({ 
  item, 
  isPageConfig,
  onClick 
}) => {
  const index = isPageConfig ? item.Index : item.index;
  const title = isPageConfig ? item.Title : item.title;

  return (
    <StyledSourceItem onClick={() => onClick(item)}>
      <StyledSourceItemSpace>
        {index && <StyledItemOrder>{index}</StyledItemOrder>}
        {title && <StyledItemTitle>{title}</StyledItemTitle>}
      </StyledSourceItemSpace>
    </StyledSourceItem>
  );
};

/**
 * SourceContent - 参考资料核心展示组件
 * 
 * @example
 * ```tsx
 * <SourceContent 
 *   items={[
 *     { title: '参考文档1', text: '内容...', index: '1', type: 'rag' },
 *     { title: '搜索结果1', url: 'https://...', type: 'web_search' }
 *   ]}
 *   status="Success"
 *   onItemClick={(item) => console.log('点击了', item)}
 *   onWebSearchClick={(items) => console.log('网页搜索', items)}
 * />
 * ```
 */
export const SourceContent: React.FC<SourceContentProps> = ({
  items,
  status = 'Success',
  isPageConfig = false,
  onItemClick,
  onWebSearchClick,
  className,
  style,
}) => {
  // 提取唯一图片
  const uniqueImages = useMemo(() => {
    let images;
    if (isPageConfig) {
      images = items?.filter(item => item.Images)?.map(item => item.Images);
    } else {
      images = items?.filter(item => item.images)?.map(item => item.images);
    }
    return uniq(flatten(images));
  }, [items, isPageConfig]);

  // RAG类型的参考资料
  const ragArray = useMemo(() => {
    if (isPageConfig) {
      return items?.filter(item => item.Type === 'rag') || [];
    } else {
      return items?.filter(item => item.type === 'rag') || [];
    }
  }, [items, isPageConfig]);

  // 网页搜索结果
  const webSearchArray = useMemo(() => {
    if (isPageConfig) {
      return items?.filter(item => item.Type === 'web_search') || [];
    } else {
      return items?.filter(item => item.type === 'web_search') || [];
    }
  }, [items, isPageConfig]);

  // 点击处理
  const handleItemClick = (item: SourceItem) => {
    onItemClick?.(item);
  };

  const handleWebSearchClick = () => {
    onWebSearchClick?.(webSearchArray);
  };

  // 只在成功状态下显示
  if (status !== 'Success') {
    return null;
  }

  return (
    <StyledSource className={className} style={style}>
      {/* 网页搜索结果 */}
      {webSearchArray.length > 0 && (
        <StyledWebSearchSource onClick={handleWebSearchClick}>
          <SearchOutlined />
          <div>已搜索到{webSearchArray.length}个网页</div>
        </StyledWebSearchSource>
      )}

      {/* RAG参考资料 */}
      {ragArray.length > 0 && (
        <StyledAnswerSource>
          <StyledLabel>回答来源：</StyledLabel>
          <div style={{ width: 'calc(100% - 70px)' }}>
            {ragArray.map((item, index) => (
              <SourceItemComponent
                key={index}
                item={item}
                isPageConfig={isPageConfig}
                onClick={handleItemClick}
              />
            ))}
          </div>
        </StyledAnswerSource>
      )}

      {/* 图片来源 */}
      {uniqueImages.length > 0 && (
        <StyledAnswerSource>
          <StyledLabel>图片来源：</StyledLabel>
          <StyledWrapSpace>
            {uniqueImages.map((image, index) => (
              <StyledImageBox key={index}>
                <Image src={image} width={50} height={50} />
              </StyledImageBox>
            ))}
          </StyledWrapSpace>
        </StyledAnswerSource>
      )}
    </StyledSource>
  );
};

export default SourceContent;

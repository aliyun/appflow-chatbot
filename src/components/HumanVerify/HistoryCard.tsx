import React from 'react';
import { Button } from 'antd';
import styled from 'styled-components';
import CustomParamsRenderer from './CustomParamsRenderer';
import { CustomParamSchema } from './CustomParamsRenderer/types';

// ==================== Styled Components ====================

const HistoryCardContainer = styled.div`
  margin-top: 12px;
  width: 400px;
  max-width: 100%;
`;

const StatusContainer = styled.div<{ $approved: boolean }>`
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: ${props => props.$approved ? 'rgb(238, 244, 248)' : 'rgb(252, 250, 245)'};
  border: 1px solid ${props => props.$approved ? 'rgb(238, 244, 248)' : 'rgb(252, 250, 245)'};
`;

const StatusContent = styled.div`
  flex: 1;
`;

const StatusText = styled.div`
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
`;

// ==================== Types ====================

export interface HistoryCardProps {
  /** 消息数据对象 */
  data: any;
}

/**
 * 将后端返回的小写 schema 转换为组件需要的大写格式
 * @param schema 后端返回的 schema（小写字段名）
 * @returns 转换后的 schema（大写字段名）
 */
export const convertSchemaToUpperCase = (schema: any): CustomParamSchema | undefined => {
  if (!schema) return undefined;

  const result: CustomParamSchema = {
    Type: schema.type || 'string',
  };

  if (schema.title) {
    result.Title = schema.title;
  }

  if (schema.description) {
    result.Description = schema.description;
  }

  if (schema.required && Array.isArray(schema.required)) {
    result.Required = schema.required;
  }

  // 排序字段
  if (schema.order !== undefined) {
    result.order = schema.order;
  }

  // 处理 AssociationPropertyMetadata
  if (schema.associationPropertyMetadata) {
    const metadata = schema.associationPropertyMetadata;
    result.AssociationPropertyMetadata = {};
    
    // SubType（数组格式）
    if (metadata.subType) {
      const subType = metadata.subType;
      // 确保是数组格式
      result.AssociationPropertyMetadata.SubType = Array.isArray(subType) ? subType : [subType];
    }
    
    // EnumValues
    if (metadata.enumValues) {
      result.AssociationPropertyMetadata.EnumValues = metadata.enumValues;
    }
    
    // EnumDisplayStyle
    if (metadata.enumDisplayStyle) {
      result.AssociationPropertyMetadata.EnumDisplayStyle = metadata.enumDisplayStyle;
    }
  }

  if ((schema.properties && typeof schema.properties === 'object')) {
    result.Properties = {};
    for (const [key, value] of Object.entries(schema.properties)) {
      const converted = convertSchemaToUpperCase(value);
      if (converted) {
        result.Properties[key] = converted;
      }
    }
  }

  if (schema.items) {
    result.Items = convertSchemaToUpperCase(schema.items);
  }

  return result;
};

/**
 * HistoryCard 历史卡片组件 (SDK 版本)
 * 用于展示历史对话中的 card 类型消息（只读模式）
 */
export const HistoryCard: React.FC<HistoryCardProps> = ({ data }) => {
  // 从data中提取需要的参数
  const approvalStatus = data?.approvalStatus;
  
  // 使用测试数据或真实数据
  const formValues = (data?.formValues || {});
  const formSchema = data?.formSchema;

  // 判断是否已提交
  const isApproved = approvalStatus === 'approved';

  // 如果没有表单 schema，只显示状态
  if (!formSchema) {
    return (
      <HistoryCardContainer>
        <StatusContainer $approved={isApproved}>
          <StatusContent>
            <StatusText>
              {isApproved ? '已提交' : '待提交'}
            </StatusText>
          </StatusContent>
          <Button 
            color="primary" 
            variant="filled"
            disabled={true}
          >
            {isApproved ? '已提交' : '提交'}
          </Button>
        </StatusContainer>
      </HistoryCardContainer>
    );
  }

  return (
    <HistoryCardContainer>
      <CustomParamsRenderer
        schema={formSchema}
        value={formValues}
        disabled={true}
      />
      <StatusContainer $approved={isApproved}>
        <StatusContent>
          <StatusText>
            {isApproved ? '已提交' : '待提交'}
          </StatusText>
        </StatusContent>
        <Button 
          color="primary" 
          variant="filled"
          disabled={true}
        >
          {isApproved ? '已提交' : '提交'}
        </Button>
      </StatusContainer>
    </HistoryCardContainer>
  );
};

export default HistoryCard;

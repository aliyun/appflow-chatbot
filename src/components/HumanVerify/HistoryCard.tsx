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
  /** 审批状态 */
  approvalStatus?: string;
  /** 表单值 */
  formValues?: Record<string, any>;
  /** 表单 Schema */
  formSchema?: CustomParamSchema;
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

  if (schema.properties && typeof schema.properties === 'object') {
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
 * 
 * @example
 * ```tsx
 * <HistoryCard
 *   approvalStatus="approved"
 *   formValues={{ name: 'test', age: 18 }}
 *   formSchema={schema}
 * />
 * ```
 */
export const HistoryCard: React.FC<HistoryCardProps> = ({
  approvalStatus,
  formValues = {},
  formSchema,
}) => {
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

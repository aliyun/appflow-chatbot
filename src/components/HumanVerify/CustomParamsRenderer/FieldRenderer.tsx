import React, { useCallback, useContext } from 'react';
import { Input, InputNumber, Switch, ConfigProvider } from 'antd';
import styled from 'styled-components';
import { FieldRendererProps } from './types';
import { ArrayField } from './ArrayField';
import { ObjectField } from './ObjectField';

// ==================== Styled Components ====================

const FieldItem = styled.div`
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const FieldLabel = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  font-size: 14px;
  color: #1f2329;
`;

const Required = styled.span`
  color: #f54a45;
  margin-right: 4px;
`;

const LabelText = styled.span`
  font-weight: 500;
`;

const FieldDescription = styled.div`
  font-size: 12px;
  color: #8f959e;
  margin-top: 4px;
  word-break: break-word;
`;

const FieldError = styled.div`
  font-size: 12px;
  color: #f54a45;
  margin-top: 4px;
`;

/**
 * InputWrapper 组件
 * 支持动态 prefixCls，自动继承用户项目的 ConfigProvider 配置
 */
const InputWrapper = styled.div<{ $prefixCls: string }>`
  .${props => props.$prefixCls}-input,
  .${props => props.$prefixCls}-input-number,
  .${props => props.$prefixCls}-select {
    width: 100%;
  }

  .${props => props.$prefixCls}-input-number {
    width: 100%;
  }
`;

/**
 * 单个字段渲染器
 * 根据字段类型渲染对应的输入组件
 */
export const FieldRenderer: React.FC<FieldRendererProps> = ({
  name,
  schema,
  value,
  onChange,
  required = false,
  disabled = false,
  level = 0,
  errors = {},
  fieldPath = '',
}) => {
  const { Type, Title, Description } = schema;
  const displayTitle = Title || name;
  
  // 获取 Ant Design 的 prefixCls 配置，自动继承用户项目的 ConfigProvider 设置
  // 使用 ConfigProvider.ConfigContext 获取完整配置
  const configContext = useContext(ConfigProvider.ConfigContext);
  const prefixCls = configContext.getPrefixCls?.() || 'ant';
  
  // 计算当前字段的完整路径
  const currentPath = fieldPath ? `${fieldPath}.${name}` : name;
  // 获取当前字段的错误信息
  const errorMessage = errors[currentPath];

  // 处理值变化
  const handleChange = useCallback(
    (newValue: any) => {
      onChange?.(newValue);
    },
    [onChange]
  );

  // 渲染基础类型输入框
  const renderInput = () => {
    switch (Type) {
      case 'string':
        return (
          <InputWrapper $prefixCls={prefixCls}>
            <Input
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              disabled={disabled}
            />
          </InputWrapper>
        );

      case 'number':
        return (
          <InputWrapper $prefixCls={prefixCls}>
            <InputNumber
              value={value}
              onChange={handleChange}
              disabled={disabled}
              style={{ width: '100%' }}
            />
          </InputWrapper>
        );

      case 'boolean':
        return (
          <Switch
            style={{borderRadius: 16}}
            checked={value}
            onChange={handleChange}
            disabled={disabled}
          />
        );

      case 'array':
        return (
          <ArrayField
            name={name}
            schema={schema}
            value={value}
            onChange={handleChange}
            required={required}
            disabled={disabled}
            level={level}
            errors={errors}
            fieldPath={fieldPath}
          />
        );

      case 'object':
        return (
          <ObjectField
            name={name}
            schema={schema}
            value={value}
            onChange={handleChange}
            required={required}
            disabled={disabled}
            level={level}
            errors={errors}
            fieldPath={fieldPath}
          />
        );

      default:
        return (
          <InputWrapper $prefixCls={prefixCls}>
            <Input
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              disabled={disabled}
            />
          </InputWrapper>
        );
    }
  };

  // 对于 object 和 array 类型，直接渲染，不需要外层包装
  if (Type === 'object' || Type === 'array') {
    return renderInput();
  }

  // 基础类型渲染带标签的表单项
  return (
    <FieldItem>
      <FieldLabel>
        {required && <Required>*</Required>}
        <LabelText>{displayTitle}</LabelText>
      </FieldLabel>
      {renderInput()}
      {errorMessage && (
        <FieldError>{errorMessage}</FieldError>
      )}
      {Description && !errorMessage && (
        <FieldDescription>{Description}</FieldDescription>
      )}
    </FieldItem>
  );
};

export default FieldRenderer;

import React, { useCallback, useContext, useMemo } from 'react';
import { ConfigProvider, Input, InputNumber, Switch } from 'antd';
import { FieldRendererProps, CustomParamSchema } from './types';
import { ArrayField } from './ArrayField';
import { ObjectField } from './ObjectField';
import { EnumField } from './EnumField';
import styled from 'styled-components';
import TimeField from './TimeField';
import FileField from './FileField';
import { useTranslation } from '../../../i18n';


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

// 数组字段容器（用于多选枚举数组）
const ArrayFieldContainer = styled.div`
  border: 1px solid #dbdbdb;
  border-radius: 10px;
  padding: 24px 16px;
  position: relative;
  margin-top: 20px;
  margin-bottom: 20px;
  background-color: #fff;
`;

// 数组标题
const ArrayTitle = styled.div`
  position: absolute;
  top: -12px;
  left: 15px;
  background: #fff;
  padding: 2px 10px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-all;
  max-width: calc(100% - 30px);
  font-size: 14px;
  font-weight: 500;
  color: #1f2329;
`;

// 数组描述
const ArrayDescription = styled.div`
  font-size: 12px;
  color: #8f959e;
  margin-bottom: 12px;
  word-break: break-word;
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
 * 判断是否有枚举值
 * 优先从 AssociationPropertyMetadata 中读取，兼容旧的 EnumValues 字段
 */
const hasEnumValues = (schema: CustomParamSchema): boolean => {
  const enumValues = schema.AssociationPropertyMetadata?.EnumValues || schema.EnumValues;
  return Array.isArray(enumValues) && enumValues.length > 0;
};

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
  uploadSender,
  fileUploader,
  hideLabel = false,
}) => {
  const { Type, Title, Description } = schema;
  const displayTitle = Title || name;
  const { t } = useTranslation();

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

  // 判断是否为枚举类型
  const isEnum = useMemo(() => hasEnumValues(schema), [schema]);

  // 渲染基础类型输入框
  const renderInput = () => {
    // 优先处理枚举类型
    if (isEnum) {
      return (
        <EnumField
          name={name}
          schema={schema}
          value={value}
          onChange={handleChange}
          required={required}
          disabled={disabled}
        />
      );
    }

    switch (Type) {
      case 'string':
        return (
          <InputWrapper $prefixCls={prefixCls}>
            <Input
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              disabled={disabled}
              placeholder={t('humanVerify.placeholder.input', { title: displayTitle })}
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
              placeholder={t('humanVerify.placeholder.input', { title: displayTitle })}
            />
          </InputWrapper>
        );

      case 'boolean':
        return (
          <Switch
            style={{ borderRadius: 16 }}
            checked={value}
            onChange={handleChange}
            disabled={disabled}
          />
        );

      case 'time':
        return (
          <TimeField
            name={name}
            schema={schema}
            value={value}
            onChange={handleChange}
            required={required}
            disabled={disabled}
          />
        );

      case 'file':
        return (
          <FileField
            name={name}
            schema={schema}
            value={value}
            onChange={handleChange}
            required={required}
            disabled={disabled}
            uploadSender={uploadSender}
            fileUploader={fileUploader}
          />
        );

      case 'array': {
        // 检查是否为多选枚举类型的数组（multi-select 或 checkbox）
        // 这种情况下，数组本身就是多选的结果，不需要再套一层数组逻辑
        const itemsSchema = schema?.Items;
        const itemsEnumValues = itemsSchema?.AssociationPropertyMetadata?.EnumValues;
        const itemsEnumDisplayStyle = itemsSchema?.AssociationPropertyMetadata?.EnumDisplayStyle;
        const isMultiSelectEnumArray = Array.isArray(itemsEnumValues) && itemsEnumValues.length > 0 &&
          (itemsEnumDisplayStyle === 'multi-select' || itemsEnumDisplayStyle === 'checkbox');
        
        if (isMultiSelectEnumArray && itemsSchema) {
          // 使用数组样式外框包裹 EnumField，保持数组的视觉一致性
          // 但不渲染增加/删除按钮，因为多选组件本身已经支持多选
          return (
            <ArrayFieldContainer>
              <ArrayTitle>
                {required && <Required>*</Required>}
                <span>{displayTitle}</span>
              </ArrayTitle>
              {Description && (
                <ArrayDescription>{Description}</ArrayDescription>
              )}
              <EnumField
                name={name}
                schema={{
                  ...itemsSchema,
                  Title: schema.Title || itemsSchema.Title,
                }}
                value={value}
                onChange={handleChange}
                required={required}
                disabled={disabled}
              />
            </ArrayFieldContainer>
          );
        }
        
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
            uploadSender={uploadSender}
            fileUploader={fileUploader}
          />
        );
      }

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
            uploadSender={uploadSender}
            fileUploader={fileUploader}
          />
        );

      default:
        return (
          <InputWrapper $prefixCls={prefixCls}>
            <Input
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              disabled={disabled}
              placeholder={t('humanVerify.placeholder.input', { title: displayTitle })}
            />
          </InputWrapper>
        );
    }
  };

  // 对于 object 和 array 类型（包括多选枚举数组），直接渲染，不需要外层包装
  // 因为它们内部已经有自己的样式容器
  if (Type === 'object' || Type === 'array') {
    return renderInput();
  }

  // 如果隐藏标签，直接返回输入组件（用于数组项渲染）
  if (hideLabel) {
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
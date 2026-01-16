import React, { useCallback } from 'react';
import { Button, Input, InputNumber, Switch, Space } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { ArrayFieldProps, CustomParamSchema } from './types';

// 前向声明，避免循环依赖
const FieldRenderer = React.lazy(() => import('./FieldRenderer'));

// ==================== Styled Components ====================

const ArrayFieldContainer = styled.div`
  border: 1px solid #dbdbdb;
  border-radius: 10px;
  padding: 24px 16px;
  position: relative;
  margin-top: 20px;
  margin-bottom: 20px;
  background-color: #fff;
`;

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

const Required = styled.span`
  display: inline-block;
  margin-right: 4px;
  color: #E00000;
  font-size: 14px;
  font-family: SimSun, sans-serif;
  line-height: 1;
`;

const ArrayDescription = styled.div`
  font-size: 12px;
  color: #8f959e;
  margin-bottom: 12px;
  word-break: break-word;
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

const ArrayItems = styled.div``;

const ArrayItem = styled.div`
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ArrayItemContent = styled.div`
  width: 100%;
`;

const ArrayItemRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ArrayItemInput = styled.div`
  flex: 1;
`;

const ArrayItemActions = styled.div`
  flex-shrink: 0;
  padding-top: 4px;
`;

const ArrayActions = styled.div`
  margin-top: 12px;
  display: flex;
  gap: 8px;
`;

/**
 * 获取数组项的默认值
 */
const getDefaultValue = (schema: CustomParamSchema): any => {
  switch (schema.Type) {
    case 'string':
      return '';
    case 'number':
      return undefined;
    case 'boolean':
      return false;
    case 'array':
      // 所有数组类型都自动初始化一条数据
      if (schema.Items) {
        return [getDefaultValue(schema.Items)];
      }
      return [];
    case 'object':
      if (schema.Properties) {
        const obj: Record<string, any> = {};
        Object.keys(schema.Properties).forEach((key) => {
          obj[key] = getDefaultValue(schema.Properties![key]);
        });
        return obj;
      }
      return {};
    default:
      return undefined;
  }
};

/**
 * 数组类型字段渲染器
 * 不展示 Items 层级，直接渲染数组项内容
 */
export const ArrayField: React.FC<ArrayFieldProps> = ({
  name,
  schema,
  value = [],
  onChange,
  required = false,
  disabled = false,
  level = 0,
  errors = {},
  fieldPath = '',
}) => {
  const { Title, Description, Items } = schema;
  const displayTitle = Title || name;
  
  // 计算当前数组的完整路径
  const currentPath = fieldPath ? `${fieldPath}.${name}` : name;

  // 添加数组项
  const handleAdd = useCallback(() => {
    if (!Items) return;
    const newItem = getDefaultValue(Items);
    onChange?.([...value, newItem]);
  }, [Items, value, onChange]);

  // 删除数组项
  const handleRemove = useCallback(
    (index: number) => {
      const newValue = [...value];
      newValue.splice(index, 1);
      onChange?.(newValue);
    },
    [value, onChange]
  );

  // 更新数组项
  const handleItemChange = useCallback(
    (index: number, itemValue: any) => {
      const newValue = [...value];
      newValue[index] = itemValue;
      onChange?.(newValue);
    },
    [value, onChange]
  );

  // 更新对象类型数组项的属性
  const handleObjectPropertyChange = useCallback(
    (index: number, propertyName: string, propertyValue: any) => {
      const newValue = [...value];
      newValue[index] = {
        ...newValue[index],
        [propertyName]: propertyValue,
      };
      onChange?.(newValue);
    },
    [value, onChange]
  );

  // 判断数组项类型（必须在 early return 之前）
  const isObjectItems = Items?.Type === 'object' && Items?.Properties;
  const isArrayItems = Items?.Type === 'array';

  if (!Items) {
    return null;
  }

  const itemRequired = Items.Required || [];

  // 渲染基础类型的数组项输入框
  const renderPrimitiveInput = (item: any, index: number) => {
    let inputElement;
    
    // 计算当前数组项的路径
    const itemPath = `${currentPath}[${index}]`;
    // 获取当前数组项的错误信息
    const itemError = errors[itemPath];
    
    switch (Items.Type) {
      case 'string':
        inputElement = (
          <Input
            value={item}
            onChange={(e) => handleItemChange(index, e.target.value)}
            disabled={disabled}
          />
        );
        break;
      case 'number':
        inputElement = (
          <InputNumber
            value={item}
            onChange={(val) => handleItemChange(index, val)}
            disabled={disabled}
            style={{ width: '100%' }}
          />
        );
        break;
      case 'boolean':
        inputElement = (
          <Switch
            checked={item}
            onChange={(val) => handleItemChange(index, val)}
            disabled={disabled}
          />
        );
        break;
      default:
        inputElement = (
          <Input
            value={item}
            onChange={(e) => handleItemChange(index, e.target.value)}
            disabled={disabled}
          />
        );
    }
    
    return (
      <div>
        {inputElement}
        {itemError && (
          <FieldError>{itemError}</FieldError>
        )}
        {Items.Description && !itemError && (
          <FieldDescription>{Items.Description}</FieldDescription>
        )}
      </div>
    );
  };

  // 渲染对象类型的数组项内容（直接渲染 Properties，不展示 Items 层级）
  const renderObjectItemContent = (item: any, index: number) => {
    if (!Items.Properties) return null;

    return Object.entries(Items.Properties).map(([propertyName, propertySchema]) => {
      const isRequired = itemRequired.includes(propertyName);
      return (
        <React.Suspense key={propertyName} fallback={<div>加载中...</div>}>
          <FieldRenderer
            name={propertyName}
            schema={propertySchema}
            value={item?.[propertyName]}
            onChange={(newValue) => handleObjectPropertyChange(index, propertyName, newValue)}
            required={isRequired}
            disabled={disabled}
            level={level + 1}
            errors={errors}
            fieldPath={`${currentPath}[${index}]`}
          />
        </React.Suspense>
      );
    });
  };

  // 渲染嵌套数组类型的数组项
  const renderArrayItemContent = (item: any, index: number) => {
    return (
      <React.Suspense fallback={<div>加载中...</div>}>
        <FieldRenderer
          name={`${name}[${index}]`}
          schema={Items}
          value={item}
          onChange={(newValue) => handleItemChange(index, newValue)}
          disabled={disabled}
          level={level + 1}
          errors={errors}
          fieldPath={currentPath}
        />
      </React.Suspense>
    );
  };

  return (
    <ArrayFieldContainer>
      <ArrayTitle>
        {required && <Required>*</Required>}
        <span>{displayTitle}</span>
      </ArrayTitle>

      {Description && (
        <ArrayDescription>{Description}</ArrayDescription>
      )}

      <ArrayItems>
        {value.map((item, index) => {
            // 渲染数组项内容
            const renderItemContent = () => {
              if (isObjectItems) {
                // 对象类型：直接渲染 Properties 内容
                return (
                  <ArrayItemContent>
                    {renderObjectItemContent(item, index)}
                  </ArrayItemContent>
                );
              }
              if (isArrayItems) {
                // 嵌套数组类型
                return (
                  <ArrayItemContent>
                    {renderArrayItemContent(item, index)}
                  </ArrayItemContent>
                );
              }
              // 基础类型：渲染输入框和删除按钮
              return (
                <ArrayItemRow>
                  <ArrayItemInput>
                    {renderPrimitiveInput(item, index)}
                  </ArrayItemInput>
                  <ArrayItemActions>
                    <Button
                      type="text"
                      danger
                      icon={<MinusOutlined />}
                      onClick={() => handleRemove(index)}
                      disabled={disabled}
                      size="small"
                    />
                  </ArrayItemActions>
                </ArrayItemRow>
              );
            };

            return (
              <ArrayItem key={index}>
                {renderItemContent()}
              </ArrayItem>
            );
        })}
      </ArrayItems>

      <ArrayActions>
        <Space>
          <Button
            onClick={handleAdd}
            disabled={disabled}
            shape="circle"
            icon={<PlusOutlined />}
          />
          {(isObjectItems || isArrayItems) && value.length > 0 && (
            <Button
              onClick={() => handleRemove(value.length - 1)}
              shape="circle"
              icon={<MinusOutlined />}
              danger
              disabled={disabled}
            />
          )}
        </Space>
      </ArrayActions>
    </ArrayFieldContainer>
  );
};

export default ArrayField;

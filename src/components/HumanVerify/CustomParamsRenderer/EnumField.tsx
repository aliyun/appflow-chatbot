import React, { useCallback, useMemo } from 'react';
import { Select, Checkbox, Radio } from 'antd';
import type { RadioChangeEvent } from 'antd';
import { EnumFieldProps, EnumDisplayStyle } from './types';
import styled from 'styled-components';

const { Option } = Select;

// ==================== Styled Components ====================

// 枚举选择器容器
const EnumSelect = styled.div`
  width: 100%;

  .ant-select {
    width: 100%;
  }
`;

// 枚举复选框容器
const EnumCheckbox = styled.div`
  width: 100%;

  .ant-checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .ant-checkbox-wrapper {
    margin-right: 0;

    &:hover .ant-checkbox-inner {
      border-color: #1890ff;
    }
  }
`;

// 枚举单选按钮容器
const EnumRadio = styled.div`
  width: 100%;

  .ant-radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .ant-radio-wrapper {
    margin-right: 0;

    &:hover .ant-radio-inner {
      border-color: #1890ff;
    }
  }
`;

/**
 * 枚举字段组件
 * 根据 EnumDisplayStyle 渲染不同的选择器
 * - select: 下拉选择框
 * - multi-select: 多选下拉框
 * - checkbox: 复选框组（多选）
 * - radio: 单选按钮组
 */
export const EnumField: React.FC<EnumFieldProps> = ({
  name,
  schema,
  value,
  onChange,
  required = false,
  disabled = false,
}) => {
  const { Type } = schema;
  
  // 优先从 AssociationPropertyMetadata 中读取，兼容旧的字段
  const enumValues = useMemo(() => {
    return schema.AssociationPropertyMetadata?.EnumValues || schema.EnumValues || [];
  }, [schema]);
  
  const displayStyle: EnumDisplayStyle = useMemo(() => {
    return schema.AssociationPropertyMetadata?.EnumDisplayStyle || schema.EnumDisplayStyle || 'select';
  }, [schema]);

  // 处理 Select 变化
  const handleSelectChange = useCallback(
    (newValue: string | string[]) => {
      onChange?.(newValue);
    },
    [onChange]
  );

  // 处理 Checkbox 变化
  const handleCheckboxChange = useCallback(
    (checkedValues: (string | number | boolean)[]) => {
      onChange?.(checkedValues as string[]);
    },
    [onChange]
  );

  // 处理 Radio 变化
  const handleRadioChange = useCallback(
    (e: RadioChangeEvent) => {
      onChange?.(e.target.value);
    },
    [onChange]
  );

  // 根据展示样式渲染不同的组件
  const renderByDisplayStyle = () => {
    switch (displayStyle) {
      case 'checkbox':
        // 复选框组 - 多选
        return (
          <EnumCheckbox>
            <Checkbox.Group
              value={Array.isArray(value) ? value : value ? [value] : []}
              onChange={handleCheckboxChange}
              disabled={disabled}
            >
              {enumValues.map((item) => (
                <Checkbox key={String(item)} value={item}>
                  {String(item)}
                </Checkbox>
              ))}
            </Checkbox.Group>
          </EnumCheckbox>
        );

      case 'radio':
        // 单选按钮组
        return (
          <EnumRadio>
            <Radio.Group
              value={value}
              onChange={handleRadioChange}
              disabled={disabled}
            >
              {enumValues.map((item) => (
                <Radio key={String(item)} value={item}>
                  {String(item)}
                </Radio>
              ))}
            </Radio.Group>
          </EnumRadio>
        );

      case 'multi-select':
        // 多选下拉框
        return (
          <EnumSelect>
            <Select
              value={Array.isArray(value) ? value : value ? [value] : []}
              onChange={handleSelectChange}
              disabled={disabled}
              mode="multiple"
              placeholder={`请选择`}
              style={{ width: '100%' }}
              allowClear
            >
              {enumValues.map((item) => (
                <Option key={String(item)} value={item}>
                  {String(item)}
                </Option>
              ))}
            </Select>
          </EnumSelect>
        );

      case 'select':
      default: {
        // 下拉选择框
        // 根据原始类型决定是否支持多选
        const isMultiple = Type === 'array';
        return (
          <EnumSelect>
            <Select
              value={value}
              onChange={handleSelectChange}
              disabled={disabled}
              mode={isMultiple ? 'multiple' : undefined}
              placeholder={`请选择`}
              style={{ width: '100%' }}
              allowClear
            >
              {enumValues.map((item) => (
                <Option key={String(item)} value={item}>
                  {String(item)}
                </Option>
              ))}
            </Select>
          </EnumSelect>
        );
      }
    }
  };

  return renderByDisplayStyle();
};

export default EnumField;
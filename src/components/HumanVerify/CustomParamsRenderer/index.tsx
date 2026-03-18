import React, { useCallback } from 'react';
import styled from 'styled-components';
import { FieldRenderer } from './FieldRenderer';
import {
  CustomParamsRendererProps,
  CustomParamSchema,
  ValidationResult,
  validateCustomParams,
  sortPropertiesByOrder,
} from './types';

export * from './types';
export { FieldRenderer } from './FieldRenderer';
export { ArrayField } from './ArrayField';
export { ObjectField } from './ObjectField';
export { TimeField } from './TimeField';
export { FileField } from './FileField';
export { EnumField } from './EnumField';

// ==================== Styled Components ====================

const CustomParamsRendererContainer = styled.div`
  width: 100%;
  padding-bottom: 12px;
`;

const EmptyState = styled.div`
  padding: 24px;
  text-align: center;
  color: #8f959e;
  font-size: 12px;
  background-color: #fafafa;
  border: 1px dashed #e5e6eb;
  border-radius: 6px;
`;

/**
 * CustomParamsRenderer 组件
 * 根据 CustomParam Schema 渲染表单
 *
 * @example
 * ```tsx
 * const schema: CustomParamSchema = {
 *   Type: 'object',
 *   Properties: {
 *     name: { Type: 'string', Title: '名称', Description: '请输入名称' },
 *     age: { Type: 'number', Title: '年龄' },
 *     enabled: { Type: 'boolean', Title: '是否启用' },
 *     date: { Type: 'time', Title: '日期', TimeSubType: 'year-month-day' },
 *     file: { Type: 'file', Title: '文件', FileSubType: 'image' },
 *     status: { Type: 'string', Title: '状态', EnumValues: ['active', 'inactive'], EnumDisplayStyle: 'radio' },
 *     tags: {
 *       Type: 'array',
 *       Title: '标签',
 *       Items: { Type: 'string' }
 *     },
 *     config: {
 *       Type: 'object',
 *       Title: '配置',
 *       Properties: {
 *         key: { Type: 'string', Title: '键' },
 *         value: { Type: 'string', Title: '值' }
 *       }
 *     }
 *   },
 *   Required: ['name']
 * };
 *
 * <CustomParamsRenderer
 *   schema={schema}
 *   value={formValue}
 *   onChange={setFormValue}
 * />
 * ```
 */
export const CustomParamsRenderer: React.FC<CustomParamsRendererProps> = ({
  schema,
  value = {},
  onChange,
  disabled = false,
  errors = {},
  uploadSender,
  fileUploader,
}) => {
  const Properties = schema?.Properties;
  const Required = schema?.Required || [];

  // 处理属性值变化
  const handlePropertyChange = useCallback(
    (propertyName: string, propertyValue: any) => {
      onChange?.({
        ...value,
        [propertyName]: propertyValue,
      });
    },
    [value, onChange]
  );

  // 如果没有 Properties，返回空
  if (!Properties || Object.keys(Properties).length === 0) {
    return (
      <CustomParamsRendererContainer>
        <EmptyState>暂无参数配置</EmptyState>
      </CustomParamsRendererContainer>
    );
  }

  // 使用排序后的属性列表进行渲染
  const sortedProperties = sortPropertiesByOrder(Properties);

  return (
    <CustomParamsRendererContainer>
      {sortedProperties?.map(([propertyName, propertySchema]) => {
        const isRequired = Required.includes(propertyName);

        return (
          <FieldRenderer
            key={propertyName}
            name={propertyName}
            schema={propertySchema}
            value={value[propertyName]}
            onChange={(newValue) => handlePropertyChange(propertyName, newValue)}
            required={isRequired}
            disabled={disabled}
            level={0}
            errors={errors}
            fieldPath=""
            uploadSender={uploadSender}
            fileUploader={fileUploader}
          />
        );
      })}
    </CustomParamsRendererContainer>
  );
};

/**
 * 使用 CustomParamsRenderer 的 Hook
 * 提供表单值管理和校验功能
 */
export const useCustomParamsRenderer = (schema: CustomParamSchema) => {
  const [value, setValue] = React.useState<Record<string, any>>({});

  // 校验表单
  const validate = useCallback((): ValidationResult => {
    return validateCustomParams(schema, value);
  }, [schema, value]);

  // 重置表单
  const reset = useCallback(() => {
    setValue({});
  }, []);

  // 设置单个字段值
  const setFieldValue = useCallback((fieldName: string, fieldValue: any) => {
    setValue((prev) => ({
      ...prev,
      [fieldName]: fieldValue,
    }));
  }, []);

  // 获取单个字段值
  const getFieldValue = useCallback(
    (fieldName: string) => {
      return value[fieldName];
    },
    [value]
  );

  return {
    value,
    setValue,
    validate,
    reset,
    setFieldValue,
    getFieldValue,
  };
};

export default CustomParamsRenderer;
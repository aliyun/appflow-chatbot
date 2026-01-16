import React, { useCallback } from 'react';
import styled from 'styled-components';
import { ObjectFieldProps } from './types';

// 前向声明，避免循环依赖
const FieldRenderer = React.lazy(() => import('./FieldRenderer'));

// ==================== Styled Components ====================

const ObjectFieldContainer = styled.div`
  border: 1px solid #dbdbdb;
  border-radius: 10px;
  padding: 24px 16px;
  position: relative;
  margin-top: 20px;
  margin-bottom: 20px;
  background-color: #fff;
`;

const ObjectTitle = styled.div`
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

const ObjectDescription = styled.div`
  font-size: 12px;
  color: #8f959e;
  margin-bottom: 12px;
  word-break: break-word;
`;

const ObjectContent = styled.div`
  /* 对象内容区域 */
`;

/**
 * 对象类型字段渲染器
 */
export const ObjectField: React.FC<ObjectFieldProps> = ({
  name,
  schema,
  value = {},
  onChange,
  required = false,
  disabled = false,
  level = 0,
  errors = {},
  fieldPath = '',
}) => {
  const { Title, Description, Properties, Required: RequiredFields = [] } = schema;
  const displayTitle = Title || name;
  
  // 计算当前对象的完整路径
  const currentPath = fieldPath ? `${fieldPath}.${name}` : name;

  // 更新对象属性
  const handlePropertyChange = useCallback(
    (propertyName: string, propertyValue: any) => {
      onChange?.({
        ...value,
        [propertyName]: propertyValue,
      });
    },
    [value, onChange]
  );

  if (!Properties) {
    return null;
  }

  return (
    <ObjectFieldContainer>
      <ObjectTitle>
        {required && <Required>*</Required>}
        <span>{displayTitle}</span>
      </ObjectTitle>

      {Description && (
        <ObjectDescription>{Description}</ObjectDescription>
      )}

      <ObjectContent>
        {Object.entries(Properties).map(([propertyName, propertySchema]) => {
          const isRequired = RequiredFields.includes(propertyName);
          return (
            <React.Suspense key={propertyName} fallback={<div>加载中...</div>}>
              <FieldRenderer
                name={propertyName}
                schema={propertySchema}
                value={value[propertyName]}
                onChange={(newValue) => handlePropertyChange(propertyName, newValue)}
                required={isRequired}
                disabled={disabled}
                level={level + 1}
                errors={errors}
                fieldPath={currentPath}
              />
            </React.Suspense>
          );
        })}
      </ObjectContent>
    </ObjectFieldContainer>
  );
};

export default ObjectField;

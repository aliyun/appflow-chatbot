import React, { useCallback, useMemo } from 'react';
import { DatePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { TimeFieldProps, TimeSubType } from './types';
import styled from 'styled-components';

// ==================== Styled Components ====================

// 时间选择器容器
const TimeFieldContainer = styled.div`
  width: 100%;

  .ant-picker {
    width: 100%;
  }
`;

/**
 * 根据时间子类型获取日期格式
 */
const getDateFormat = (subType?: TimeSubType): string => {
  switch (subType) {
    case 'year-month':
      return 'YYYY-MM';
    case 'year-month-day':
      return 'YYYY-MM-DD';
    case 'datetime':
      return 'YYYY-MM-DD HH:mm:ss';
    default:
      return 'YYYY-MM-DD';
  }
};

/**
 * 根据时间子类型获取 picker 类型
 */
const getPickerType = (subType?: TimeSubType): 'date' | 'month' | undefined => {
  switch (subType) {
    case 'year-month':
      return 'month';
    case 'year-month-day':
    case 'datetime':
    default:
      return 'date';
  }
};

/**
 * 时间字段组件
 * 根据 SubType 渲染不同的时间选择器
 * 优先从 AssociationPropertyMetadata.SubType 读取，兼容旧的 TimeSubType 字段
 */
export const TimeField: React.FC<TimeFieldProps> = ({
  name,
  schema,
  value,
  onChange,
  required = false,
  disabled = false,
}) => {
  // 优先从 AssociationPropertyMetadata.SubType 读取，取数组第一个元素
  // 兼容旧的 TimeSubType 字段
  const subType = useMemo((): TimeSubType | undefined => {
    const subTypeArray = schema.AssociationPropertyMetadata?.SubType;
    if (Array.isArray(subTypeArray) && subTypeArray.length > 0) {
      return subTypeArray[0] as TimeSubType;
    }
    return schema.TimeSubType;
  }, [schema]);
  
  const format = getDateFormat(subType);
  const picker = getPickerType(subType);
  const showTime = subType === 'datetime';

  // 处理值变化
  const handleChange = useCallback(
    (date: Dayjs | null) => {
      if (date) {
        onChange?.(date.format(format));
      } else {
        onChange?.(null);
      }
    },
    [onChange, format]
  );

  // 将字符串值转换为 dayjs 对象
  const dayjsValue = value ? dayjs(value, format) : null;

  return (
    <TimeFieldContainer>
      <DatePicker
        value={dayjsValue}
        onChange={handleChange}
        format={format}
        picker={picker}
        showTime={showTime ? { format: 'HH:mm:ss' } : false}
        disabled={disabled}
        style={{ width: '100%' }}
        placeholder={`请选择`}
      />
    </TimeFieldContainer>
  );
};

export default TimeField;
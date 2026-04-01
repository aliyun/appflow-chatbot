import React, { useCallback, useMemo } from 'react';
import { DatePicker, version } from 'antd';
import { TimeFieldProps, TimeSubType } from './types';
import styled from 'styled-components';

const TimeFieldContainer = styled.div`
  width: 100%;
  .ant-picker {
    width: 100%;
  }
`;

const getAntdMajorVersion = (): number => {
  try {
    return parseInt(version.split('.')[0], 10);
  } catch {
    return 5;
  }
};

const isAntd5OrAbove = getAntdMajorVersion() >= 5;

// 同步加载时间库
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let timeLib: any = null;

if (isAntd5OrAbove) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    timeLib = require('dayjs');
  } catch {
    console.warn('dayjs not found');
  }
} else {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    timeLib = require('moment');
  } catch {
    console.warn('moment not found');
  }
}

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

const getPickerType = (subType?: TimeSubType): 'date' | 'month' | undefined => {
  switch (subType) {
    case 'year-month':
      return 'month';
    default:
      return 'date';
  }
};

export const TimeField: React.FC<TimeFieldProps> = ({
  schema,
  value,
  onChange,
  disabled = false,
}) => {
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

  // 将字符串值转换为时间对象 - 同步方式
  const dateValue = useMemo(() => {
    if (!value || !timeLib) return null;
    
    try {
      const parsed = timeLib(value, format);
      if (parsed && typeof parsed.isValid === 'function' && !parsed.isValid()) {
        // 如果严格解析失败，尝试宽松解析
        return timeLib(value);
      }
      return parsed;
    } catch {
      return null;
    }
  }, [value, format]);

  const handleChange = useCallback(
    (_date: any, dateString: string | string[]) => {
      const stringValue = Array.isArray(dateString) ? dateString[0] : dateString;
      onChange?.(stringValue || null);
    },
    [onChange]
  );

  return (
    <TimeFieldContainer>
      <DatePicker
        value={dateValue}
        onChange={handleChange}
        format={format}
        picker={picker}
        showTime={showTime ? { format: 'HH:mm:ss' } : false}
        disabled={disabled}
        style={{ width: '100%' }}
        placeholder="请选择"
      />
    </TimeFieldContainer>
  );
};

export default TimeField;

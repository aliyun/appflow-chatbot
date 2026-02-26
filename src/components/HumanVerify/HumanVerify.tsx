import React, { useCallback, useEffect, useState } from 'react';
import { Button, message } from 'antd';
import styled from 'styled-components';
import CustomParamsRenderer, { validateCustomParams, UploadSender, FileUploader } from './CustomParamsRenderer';

// ==================== Styled Components ====================

const HumanVerifyContainer = styled.div`
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

export interface HumanVerifyProps {
  /** 消息数据对象 */
  data: any;
  /** 上传发送方法 */
  uploadSender?: UploadSender;
  /** 文件上传方法 */
  fileUploader?: FileUploader;
  /** 提交回调函数 */
  onSubmit?: (data: {
    verifyId: string;
    sessionWebhook: string;
    status: string;
    customParamsKey: string;
    customParamsValue: Record<string, any>;
  }) => void;
}

/**
 * HumanVerify 人工审核组件 (SDK 版本)
 * 用于展示需要人工审核的表单，并处理提交逻辑
 */
export const HumanVerify: React.FC<HumanVerifyProps> = ({ 
  data,
  uploadSender,
  fileUploader,
  onSubmit
}) => {
  // 从 data 中提取需要的参数
  const verifyId = data?.verifyId;
  const sessionWebhook = data?.sessionWebhook;
  const approved = data?.approved || false;
  const customParamsSchema = data?.customParams;
  const customParamsKey = data?.customParamsKey;

  // CustomParams表单状态管理
  const [customParamsValue, setCustomParamsValue] = useState<Record<string, any>>({});
  // CustomParams验证错误状态
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // 实时验证：当表单值变化时，如果已经有错误信息，则重新验证
  useEffect(() => {
    // 只有在已经显示过错误的情况下才进行实时验证
    if (Object.keys(validationErrors).length > 0 && customParamsSchema) {
      const validation = validateCustomParams(customParamsSchema, customParamsValue);

      if (validation.valid) {
        // 如果验证通过，清空所有错误
        setValidationErrors({});
      } else {
        // 如果仍有错误，更新错误信息
        const errors: Record<string, string> = {};
        validation.errors.forEach((err) => {
          errors[err.field] = err.message;
        });
        setValidationErrors(errors);
      }
    }
  }, [customParamsValue, customParamsSchema, validationErrors]);

  // 处理审批按钮点击
  const handleApprove = useCallback(() => {
    if (!verifyId || !onSubmit) return;

    // 验证表单
    if (customParamsSchema) {
      const validation = validateCustomParams(customParamsSchema, customParamsValue);

      if (!validation.valid) {
        // 转换错误格式
        const errors: Record<string, string> = {};
        validation.errors.forEach((err) => {
          errors[err.field] = err.message;
        });
        setValidationErrors(errors);

        // 提示用户
        message.error('请填写所有必填项');
        return;
      }

      // 清空错误
      setValidationErrors({});
    }

    // 调用提交回调
    onSubmit?.({
      verifyId,
      sessionWebhook: sessionWebhook || '',
      status: 'approve',
      customParamsKey,
      customParamsValue,
    });
  }, [verifyId, sessionWebhook, onSubmit, customParamsValue, customParamsSchema, customParamsKey]);

  return (
    <HumanVerifyContainer>
      {customParamsSchema && (
        <CustomParamsRenderer
          schema={customParamsSchema}
          value={customParamsValue}
          onChange={setCustomParamsValue}
          errors={validationErrors}
          uploadSender={uploadSender}
          fileUploader={fileUploader}
        />
      )}
      <StatusContainer $approved={approved}>
        <StatusContent>
          <StatusText>
            {approved ? '已提交' : '待提交'}
          </StatusText>
        </StatusContent>
        <Button 
          color="primary" 
          variant="filled"
          onClick={handleApprove}
          disabled={approved}
        >
          {'提交'}
        </Button>
      </StatusContainer>
    </HumanVerifyContainer>
  );
};

export default HumanVerify;
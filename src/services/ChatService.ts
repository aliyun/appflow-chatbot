/**
 * ChatService - 独立的聊天服务类
 * 用于自定义UI场景，不依赖React
 */

import { fetchEventSource } from '@/utils/fetchEventSource';
import { fetchUploadApi } from '@/hooks/usePreSignUpload';
import Cookies from 'js-cookie';

// ==================== 类型定义 ====================

export interface SetupConfig {
  integrateId: string;
  domain?: string;
  access_session_token?: string;
}

export interface ChatConfig {
  welcome: string;
  questions: string[];
  models: ModelInfo[];
  features: {
    image: boolean;
    file: boolean;
    audio: boolean;
    webSearch: boolean;
  };
  chatbotId: string;
  integrateId: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  config?: {
    image?: boolean;
    file?: boolean;
    webSearch?: boolean;
    fileConfig?: string;
  };
}

export interface ModelCapabilities {
  image: boolean;
  file: boolean;
  audio: boolean;
  webSearch: boolean;
  fileConfig?: {
    supportFileTypes?: string[];
    limit?: number;
    description?: string;
  };
}

export interface ChatMessage {
  text?: string;
  images?: string[];
  files?: string[];
  audio?: string;
  modelId?: string;
  webSearch?: boolean;
}

export interface ChatStreamCallbacks {
  onMessage?: (content: string, done: boolean, meta?: any) => void;
  onError?: (error: Error) => void;
}

export interface ChatStream {
  onMessage(callback: (content: string, done: boolean, meta?: any) => void): ChatStream;
  onError(callback: (error: Error) => void): ChatStream;
}

export interface HistoryMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  messageType: string;
  gmtCreate?: string;
  sessionId?: string;
  images?: string[];
  files?: { name: string; url: string }[];
}

export interface ChatSession {
  id: string;
  sessionId: string;
  title: string;
  gmtCreate?: string;
  gmtModified?: string;
}

// ==================== ChatService 类 ====================

class ChatService {
  private config: ChatConfig | null = null;
  private setupConfig: SetupConfig | null = null;
  private sessionId: string = '';
  private currentController: AbortController | null = null;
  private isInitialized: boolean = false;

  /**
   * 初始化SDK并返回配置信息
   */
  async setup(config: SetupConfig): Promise<ChatConfig> {
    this.setupConfig = config;

    // 设置全局配置（兼容现有逻辑）
    if (typeof window !== 'undefined') {
      (window as any).__APPFLOW_CHAT_SERVICE_CONFIG__ = {
        integrateConfig: {
          integrateId: config.integrateId,
          domain: config.domain ? { requestDomain: config.domain } : undefined,
          access_session_token: config.access_session_token,
        }
      };
    }

    // 清除旧的ticket（如果有新的access_session_token）
    if (config.access_session_token) {
      Cookies.remove('appflow_chat_ticket');
    }

    // 获取认证票据
    await this.initTicket();

    // 获取聊天机器人配置
    const chatbotConfig = await this.fetchConfig(config.integrateId);
    this.config = chatbotConfig;
    this.isInitialized = true;

    return chatbotConfig;
  }

  /**
   * 初始化认证票据
   */
  private async initTicket(): Promise<void> {
    const domain = this.setupConfig?.domain || '';
    const ticketFromCookie = Cookies.get('appflow_chat_ticket');

    if (!ticketFromCookie) {
      try {
        const response = await fetch(`${domain}/webhook/login/init/ticket`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            loginType: 'chatbot_integrate',
            integrateId: this.setupConfig?.integrateId,
            accessSessionToken: this.setupConfig?.access_session_token
          })
        });
        const result = await response.json();
        if (result?.data && result?.code === '200') {
          Cookies.set('appflow_chat_ticket', result.data, { expires: 7 });
        }
      } catch (error) {
        console.error('初始化ticket失败:', error);
      }
    }
  }

  /**
   * 获取聊天机器人配置
   */
  private async fetchConfig(integrateId: string): Promise<ChatConfig> {
    const domain = this.setupConfig?.domain || '';

    try {
      const { token, ticket } = await this.getRequestToken();

      const response = await fetch(`${domain}/webhook/chatbot/integrate/${integrateId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Token': token,
          'X-Account-Session-Ticket': ticket,
        }
      });

      const result = await response.json();

      if (result?.httpStatusCode === 200 && result?.data) {
        const data = result.data;
        const configStr = data.integrateConfig;
        const parsedConfig = configStr ? JSON.parse(configStr) : {};

        // 解析模型列表
        const models: ModelInfo[] = (data.models || []).map((m: any) => ({
          id: m.chatbotModelId || m.ChatbotModelId,
          name: m.modelName || m.ModelName || m.chatbotModelId,
          config: {
            image: m.config?.image || m.Config?.image || m.Config?.Image,
            file: m.config?.file || m.Config?.file || m.Config?.File,
            webSearch: m.config?.webSearch || m.Config?.webSearch || m.Config?.WebSearch,
          }
        }));

        return {
          welcome: parsedConfig?.message?.welcome || '欢迎使用AI助手',
          questions: parsedConfig?.config?.questions || [],
          models,
          features: {
            image: parsedConfig?.message?.imageEnabled || false,
            file: parsedConfig?.message?.fileEnabled || false,
            audio: parsedConfig?.message?.audioEnabled || false,
            webSearch: models.some(m => m.config?.webSearch),
          },
          chatbotId: data.chatbotId,
          integrateId: integrateId,
        };
      }

      throw new Error('获取配置失败');
    } catch (error) {
      console.error('获取配置失败:', error);
      // 返回默认配置
      return {
        welcome: '欢迎使用AI助手',
        questions: [],
        models: [],
        features: { image: false, file: false, audio: false, webSearch: false },
        chatbotId: '',
        integrateId: integrateId,
      };
    }
  }

  /**
   * 获取请求令牌
   */
  private async getRequestToken(): Promise<{ token: string; ticket: string }> {
    const domain = this.setupConfig?.domain || '';
    const ticket = Cookies.get('appflow_chat_ticket') || '';

    if (!ticket) {
      throw new Error('未找到认证票据，请先调用setup');
    }

    const response = await fetch(`${domain}/webhook/request/token/acquireRequestToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Account-Session-Ticket': ticket,
      }
    });

    const result = await response.json();
    const token = result?.data;

    if (!token) {
      throw new Error('获取请求令牌失败');
    }

    return { token, ticket };
  }

  /**
   * 发送消息（流式响应）
   */
  chat(message: ChatMessage): ChatStream {
    if (!this.isInitialized || !this.config) {
      throw new Error('请先调用 setup() 初始化SDK');
    }

    const callbacks: ChatStreamCallbacks = {};

    // 异步执行发送逻辑
    this.sendMessage(message, callbacks);

    // 返回链式调用对象
    return {
      onMessage: (callback) => {
        callbacks.onMessage = callback;
        return this as unknown as ChatStream;
      },
      onError: (callback) => {
        callbacks.onError = callback;
        return this as unknown as ChatStream;
      }
    };
  }

  /**
   * 发送消息的内部实现
   */
  private async sendMessage(message: ChatMessage, callbacks: ChatStreamCallbacks): Promise<void> {
    const domain = this.setupConfig?.domain || '';
    const integrateId = this.config?.integrateId || '';
    const modelId = message.modelId || this.config?.models[0]?.id;

    // 创建新的AbortController
    this.currentController = new AbortController();

    // 用于存储完整内容（需要在try-catch外部声明以便catch中访问）
    let fullContent = '';

    try {
      const { token, ticket } = await this.getRequestToken();

      // 构建请求体
      const requestBody: any = {
        chatbotId: this.config?.chatbotId,
        chatbotModelId: modelId,
        sessionId: this.sessionId,
      };

      // 处理不同类型的消息
      if (message.audio) {
        // 语音消息
        requestBody.messageType = 'audio';
        requestBody.audio = {
          mediaUrl: message.audio,
          mediaType: 'wav'
        };
      } else if ((message.images && message.images.length > 0) || (message.files && message.files.length > 0)) {
        // 富文本消息（包含图片或文件）
        requestBody.messageType = 'rich';
        const richText: any[] = [];

        if (message.text) {
          richText.push({ type: 'text', content: message.text });
        }

        message.images?.forEach(url => {
          richText.push({ type: 'image', mediaUrl: url });
        });

        message.files?.forEach(url => {
          richText.push({ type: 'file', mediaUrl: url });
        });

        requestBody.richText = richText;
      } else {
        // 纯文本消息
        requestBody.messageType = 'text';
        requestBody.text = { content: message.text || '' };
      }

      // 添加联网搜索配置
      if (message.webSearch) {
        requestBody.config = { webSearch: true };
      }

      await fetchEventSource(
        `${domain}/webhook/chatbot/chat/${integrateId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Request-Token': token,
            'X-Account-Session-Ticket': ticket,
          },
          body: JSON.stringify(requestBody),
          signal: this.currentController.signal,
          timeout: 150 * 1000,
          onopen: async (response: Response) => {
            if (!response.ok && response.status !== 200) {
              const errorText = await response.text();
              throw new Error(errorText);
            }
          },
          onmessage: (event: any) => {
            try {
              const data = JSON.parse(event.data);

              // 更新sessionId
              if (data.sessionId) {
                this.sessionId = data.sessionId;
              }

              // 处理事件消息
              if (data.messageType === 'event') {
                return;
              }

              fullContent = data.content || '';
              const isDone = data.status !== 'Running';

              // 构建meta对象
              const meta: Record<string, any> = {
                status: data.status,
                references: data.references,
                sessionId: data.sessionId,
                messageType: data.messageType,
                messageId: data.messageId,
              };

              // 处理 card 类型消息（humanVerify 等）
              if (data.messageType === 'card') {
                meta.sessionWebhook = data.sessionWebhook;

                try {
                  const cardContent = JSON.parse(data.content);
                  meta.cardType = cardContent.type;
                  meta.cardData = cardContent.data;
                  meta.cardDisplayContent = cardContent.content;

                  // 处理 chatbot_input 类型（humanVerify 表单）
                  if (cardContent.type === 'chatbot_input') {
                    const innerData = cardContent.data;
                    meta.verifyId = innerData?.verifyId;

                    // 查找 customParams（AssociationProperty === 'CustomParams'）
                    if (innerData) {
                      for (const key in innerData) {
                        if (innerData[key] &&
                          typeof innerData[key] === 'object' &&
                          innerData[key].AssociationProperty === 'CustomParams') {
                          meta.customParamsKey = key;
                          meta.customParams = innerData[key];
                          break;
                        }
                      }
                    }
                  }

                  // 处理 update_chatbot_input 类型（审核状态更新）
                  if (cardContent.type === 'update_chatbot_input') {
                    const innerData = cardContent.data;
                    meta.approvedMessageId = innerData?.messageId;
                    meta.approvedStatus = innerData?.status;
                  }
                } catch (parseError) {
                  console.error('解析 card content 失败:', parseError);
                }
              }

              callbacks.onMessage?.(fullContent, isDone, meta);
            } catch (e) {
              console.error('解析消息失败:', e);
            }
          },
          onclose: () => {
            callbacks.onMessage?.(fullContent, true);
          },
          onerror: (error: any) => {
            callbacks.onError?.(new Error(error?.message || '请求失败'));
          }
        }
      );
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        callbacks.onMessage?.(fullContent || '', true, { status: 'Cancelled' });
      } else {
        callbacks.onError?.(error);
      }
    }
  }

  /**
   * 上传文件
   */
  async upload(file: File): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('请先调用 setup() 初始化SDK');
    }

    const domain = this.setupConfig?.domain || '';
    const integrateId = this.config?.integrateId || '';

    try {
      const { token, ticket } = await this.getRequestToken();

      // 获取上传预签名URL
      const uploadTokenResponse = await fetch(`${domain}/webhook/chatbot/chat/${integrateId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Token': token,
          'X-Account-Session-Ticket': ticket,
        },
        body: JSON.stringify({
          messageType: 'event',
          event: {
            eventType: 'uploadToken',
            content: JSON.stringify({ fileName: file.name })
          }
        })
      });

      // 解析SSE响应获取上传URL
      const reader = uploadTokenResponse.body?.getReader();
      if (!reader) throw new Error('无法读取响应');

      let uploadInfo: any = null;
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // 保留最后一行（可能不完整）
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('data:')) {
            try {
              const jsonStr = trimmedLine.slice(5).trim();
              if (jsonStr) {
                const data = JSON.parse(jsonStr);
                if (data.content) {
                  // content 可能是字符串或对象
                  const contentData = typeof data.content === 'string'
                    ? JSON.parse(data.content)
                    : data.content;
                  if (contentData.uploadUrl) {
                    uploadInfo = contentData;
                  }
                }
              }
            } catch (e) {
              // 忽略解析错误，继续处理下一行
              console.debug('解析SSE行失败:', line, e);
            }
          }
        }
      }

      // 处理buffer中剩余的数据
      if (buffer.trim().startsWith('data:')) {
        try {
          const jsonStr = buffer.trim().slice(5).trim();
          if (jsonStr) {
            const data = JSON.parse(jsonStr);
            if (data.content) {
              const contentData = typeof data.content === 'string'
                ? JSON.parse(data.content)
                : data.content;
              if (contentData.uploadUrl) {
                uploadInfo = contentData;
              }
            }
          }
        } catch (e) {
          console.debug('解析SSE剩余数据失败:', buffer, e);
        }
      }

      if (!uploadInfo?.uploadUrl) {
        console.error('获取上传URL失败，uploadInfo:', uploadInfo);
        throw new Error('获取上传URL失败');
      }

      // 上传文件
      const blob = new Blob([file], { type: file.type || 'application/octet-stream' });
      await fetchUploadApi(blob, uploadInfo.uploadUrl);

      // 确保返回有效的downloadUrl
      if (!uploadInfo.downloadUrl) {
        console.error('downloadUrl为空，uploadInfo:', uploadInfo);
        throw new Error('获取下载URL失败');
      }

      return uploadInfo.downloadUrl;
    } catch (error) {
      console.error('上传文件失败:', error);
      throw error;
    }
  }

  /**
   * 清除会话
   */
  clear(): void {
    this.sessionId = '';
    this.cancel();
  }

  /**
   * 取消当前请求
   */
  cancel(): void {
    if (this.currentController) {
      this.currentController.abort();
      this.currentController = null;
    }
  }

  /**
   * 获取当前配置
   */
  getConfig(): ChatConfig | null {
    return this.config;
  }

  /**
   * 获取当前会话ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * 获取指定模型的能力配置
   * @param modelId 模型ID，不传则使用第一个模型
   */
  getModelCapabilities(modelId?: string): ModelCapabilities {
    if (!this.config) {
      return { image: false, file: false, audio: false, webSearch: false };
    }

    const model = modelId
      ? this.config.models.find(m => m.id === modelId)
      : this.config.models[0];

    if (!model) {
      return { image: false, file: false, audio: false, webSearch: false };
    }

    // 解析fileConfig
    let fileConfig: ModelCapabilities['fileConfig'] = undefined;
    if (model.config?.fileConfig) {
      try {
        fileConfig = JSON.parse(model.config.fileConfig);
      } catch (e) {
        // 忽略解析错误
      }
    }

    return {
      // 图片：需要全局开启 + 模型支持
      image: Boolean(this.config.features.image && model.config?.image),
      // 文件：需要全局开启 + 模型支持
      file: Boolean(this.config.features.file && model.config?.file),
      // 语音：只需要全局开启
      audio: Boolean(this.config.features.audio),
      // 联网搜索：模型支持即可
      webSearch: Boolean(model.config?.webSearch),
      // 文件配置
      fileConfig,
    };
  }

  /**
   * 检查指定模型是否支持某个功能
   * @param capability 功能名称
   * @param modelId 模型ID，不传则使用第一个模型
   */
  hasCapability(capability: 'image' | 'file' | 'audio' | 'webSearch', modelId?: string): boolean {
    const caps = this.getModelCapabilities(modelId);
    return caps[capability];
  }

  /**
   * 设置当前会话ID
   * @param sessionId 会话ID
   */
  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
  }

  /**
   * 获取对话历史记录
   * @param sessionId 会话ID，不传则使用当前会话ID
   * @returns 历史消息列表
   */
  async getHistory(sessionId?: string): Promise<HistoryMessage[]> {
    if (!this.isInitialized) {
      throw new Error('请先调用 setup() 初始化SDK');
    }

    const domain = this.setupConfig?.domain || '';
    const integrateId = this.config?.integrateId || '';
    const targetSessionId = sessionId || this.sessionId;

    try {
      const { token, ticket } = await this.getRequestToken();

      const response = await fetch(`${domain}/webhook/chatbot/integrate/${integrateId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Token': token,
          'X-Account-Session-Ticket': ticket,
        },
        body: targetSessionId ? JSON.stringify({ sessionId: targetSessionId }) : undefined,
      });

      const result = await response.json();

      if (result?.httpStatusCode === 200 && result?.data) {
        // 解析历史消息
        const messages: HistoryMessage[] = [];
        const data = result.data;

        // 处理消息列表
        if (Array.isArray(data)) {
          for (const item of data) {
            // 用户消息 - 在 message 字段中
            if (item.message !== undefined && item.message !== null) {
              const messageType = item.messageType || 'text';
              let content = '';
              let images: string[] | undefined;
              let files: { name: string; url: string }[] | undefined;

              if (messageType === 'rich' && Array.isArray(item.message)) {
                // rich类型消息：message是数组
                const textParts: string[] = [];
                const imageUrls: string[] = [];
                const fileList: { name: string; url: string }[] = [];

                for (const part of item.message) {
                  if (part.type === 'text' && part.content) {
                    textParts.push(part.content);
                  } else if (part.type === 'image' && part.mediaUrl) {
                    imageUrls.push(part.mediaUrl);
                  } else if (part.type === 'file' && part.mediaUrl) {
                    fileList.push({
                      name: part.mediaName || '文件',
                      url: part.mediaUrl,
                    });
                  }
                }

                content = textParts.join('\n');
                if (imageUrls.length > 0) images = imageUrls;
                if (fileList.length > 0) files = fileList;
              } else if (typeof item.message === 'string') {
                // text类型消息：message是字符串
                content = item.message;
              }

              messages.push({
                id: item.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                role: 'user',
                content,
                messageType,
                gmtCreate: item.gmtCreate,
                sessionId: item.sessionId,
                images,
                files,
              });
            }

            // AI回复 - 在 assistant 数组中
            if (item.assistant && Array.isArray(item.assistant) && item.assistant.length > 0) {
              // 取第一个assistant回复
              const assistantMsg = item.assistant[0];
              messages.push({
                id: assistantMsg.messageId || `assistant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                role: 'assistant',
                content: assistantMsg.content || '',
                messageType: assistantMsg.messageType || 'text',
                gmtCreate: item.gmtCreate,
                sessionId: assistantMsg.sessionId || item.sessionId,
              });
            }
          }
        }

        return messages;
      }

      return [];
    } catch (error) {
      console.error('获取历史记录失败:', error);
      throw error;
    }
  }

  /**
   * 获取会话列表
   * @returns 会话列表
   */
  async getSessions(): Promise<ChatSession[]> {
    if (!this.isInitialized) {
      throw new Error('请先调用 setup() 初始化SDK');
    }

    const domain = this.setupConfig?.domain || '';
    const integrateId = this.config?.integrateId || '';

    try {
      const { token, ticket } = await this.getRequestToken();

      // 使用 /message 接口，不传 sessionId 时返回会话列表
      const response = await fetch(`${domain}/webhook/chatbot/integrate/${integrateId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Token': token,
          'X-Account-Session-Ticket': ticket,
        },
      });

      const result = await response.json();

      if (result?.httpStatusCode === 200 && result?.data) {
        const sessions: ChatSession[] = (result.data || []).map((item: any) => ({
          id: item.id,
          sessionId: item.sessionId,
          title: item.title || '未命名会话',
          gmtCreate: item.gmtCreate,
          gmtModified: item.gmtModified,
        }));

        return sessions;
      }

      return [];
    } catch (error) {
      console.error('获取会话列表失败:', error);
      throw error;
    }
  }

  /**
   * 发送事件回调消息
   * 用于 humanVerify、cardCallBack 等需要向服务端发送回调的场景
   * 
   * @param data 回调数据
   * @param data.sessionWebhook 会话 Webhook URL
   * @param data.content 回调内容对象
   * @returns Promise<void>
   * 
   * @example
   * ```typescript
   * await chatService.sendEventCallback({
   *   sessionWebhook: 'https://...',
   *   content: {
   *     verifyId: 'xxx',
   *     status: 'approve',
   *     customParams: { ... }
   *   }
   * });
   * ```
   */
  async sendEventCallback(data: {
    sessionWebhook: string;
    content: Record<string, any>;
  }): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('请先调用 setup() 初始化SDK');
    }

    const { sessionWebhook, content } = data;

    if (!sessionWebhook) {
      throw new Error('sessionWebhook 不能为空');
    }

    try {
      const { token, ticket } = await this.getRequestToken();

      const response = await fetch(sessionWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Token': token,
          'X-Account-Session-Ticket': ticket,
        },
        body: JSON.stringify(content),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`发送事件回调失败: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error('发送事件回调失败:', error);
      throw error;
    }
  }

  /**
   * 提交人工审核结果
   * 这是 sendEventCallback 的便捷封装，专门用于 HumanVerify 场景
   * 
   * @param data 审核数据
   * @param data.verifyId 验证ID
   * @param data.sessionWebhook 会话 Webhook URL
   * @param data.status 审核状态 ('approve' | 'reject')
   * @param data.customParams 自定义参数值
   * @param data.customParamsKey 自定义参数的字段名，默认为 'customParams'
   * @returns Promise<void>
   * 
   * @example
   * ```typescript
   * await chatService.submitHumanVerify({
   *   verifyId: 'xxx',
   *   sessionWebhook: 'https://...',
   *   status: 'approve',
   *   customParams: { name: '张三', age: 25 },
   *   customParamsKey: 'formData'
   * });
   * ```
   */
  async submitHumanVerify(data: {
    verifyId: string;
    sessionWebhook: string;
    status: 'approve' | 'reject';
    customParams?: Record<string, any>;
    customParamsKey?: string;
  }): Promise<void> {
    const { verifyId, sessionWebhook, status, customParams, customParamsKey = 'customParams' } = data;

    if (!verifyId) {
      throw new Error('verifyId 不能为空');
    }

    const content: Record<string, any> = {
      verifyId,
      status,
    };

    // 如果有自定义参数，添加到 content 中
    if (customParams) {
      content[customParamsKey] = customParams;
    }

    return this.sendEventCallback({
      sessionWebhook,
      content,
    });
  }
}

// 导出单例
export const chatService = new ChatService();
export default ChatService;
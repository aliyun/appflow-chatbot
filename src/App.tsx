import { useState } from 'react';
import { ConfigProvider } from 'antd';
import { ChatSender } from './components/ChatSender';
import { MessageBubble } from './components/MessageBubble';
import type { ChatSenderSubmitData } from './components/ChatSender';
import type { ModelInfo, ModelCapabilities } from './services/ChatService';

// 模拟模型列表
const mockModels: ModelInfo[] = [
  { id: 'model-1', name: '通义千问-VL', config: { image: true, file: true, webSearch: true , audio: true } },
  { id: 'model-2', name: '通义千问-Max', config: { image: false, file: false, webSearch: true } },
  { id: 'model-3', name: 'DeepSeek-R1', config: { image: false, file: false, webSearch: false } },
];

// 模拟上传
const mockUpload = async (file: File, _modelId?: string): Promise<{ downloadUrl: string; fileId?: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 音频文件返回 blob URL，以便本地测试播放
      if (file.type.startsWith('audio/')) {
        resolve({ downloadUrl: URL.createObjectURL(file) });
      } else if (file.type.startsWith('image/')) {
        resolve({ downloadUrl: `https://example.com/files/${file.name}` });
      } else {
        // 非图片文件模拟返回 fileId
        resolve({ downloadUrl: `https://example.com/files/${file.name}`, fileId: `mock_fid_${Date.now()}` });
      }
    }, 1500);
  });
};

function App() {
  const [loading, setLoading] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState(mockModels[0].id);
  const [logs, setLogs] = useState<string[]>([]);

  // 根据选中模型计算能力
  const currentModel = mockModels.find(m => m.id === selectedModelId) || mockModels[0];
  const capabilities: ModelCapabilities = {
    image: currentModel.config?.image ?? false,
    file: currentModel.config?.file ?? false,
    audio: currentModel.config?.audio ?? false,
    webSearch: currentModel.config?.webSearch ?? false,
  };

  const addLog = (message: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev].slice(0, 50));
  };

  // 消息列表
  interface Message {
    id: string;
    role: 'user' | 'bot';
    content: string;
    status: 'Running' | 'Success' | 'Error';
    images?: string[];
    files?: { name: string; url: string }[];
  }

  const [messages, setMessages] = useState<Message[]>([]);

  const handleSubmit = (data: ChatSenderSubmitData) => {
    addLog(`发送消息: text="${data.text}", model=${data.modelId}, images=${data.images.length}, files=${data.files.length}, audio=${data.audio || 'none'}, webSearch=${data.webSearch}`);

    // 构建用户消息（包含图片和文件）
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: data.text,
      status: 'Success',
      images: data.images.length > 0 ? data.images : undefined,
      files: data.files.length > 0 ? data.files : undefined,
    };

    // 构建 bot 占位消息
    const botMsg: Message = {
      id: `msg-${Date.now() + 1}`,
      role: 'bot',
      content: '',
      status: 'Running',
    };

    setMessages(prev => [...prev, userMsg, botMsg]);
    setLoading(true);

    // 模拟 AI 回复
    setTimeout(() => {
      setMessages(prev => prev.map(m =>
        m.id === botMsg.id
          ? { ...m, content: '收到你的消息！这是一条模拟的 AI 回复。', status: 'Success' as const }
          : m
      ));
      setLoading(false);
      addLog('AI 回复完成');
    }, 2000);
  };

  const handleCancel = () => {
    setLoading(false);
    addLog('取消请求');
  };

  // 切换能力的控制面板
  const [showUpload, setShowUpload] = useState(true);
  const [showAudio, setShowAudio] = useState(false);

  const adjustedCapabilities: ModelCapabilities = {
    ...capabilities,
    image: showUpload && capabilities.image,
    file: showUpload && capabilities.file,
    audio: showAudio,
  };

  return (
    <ConfigProvider>
      <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
        <h2 style={{ marginBottom: 24, color: '#333' }}>ChatSender 组件预览</h2>

        {/* 控制面板 */}
        <div style={{ marginBottom: 24, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#666' }}>功能开关（模拟 capabilities 控制）</h4>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <input type="checkbox" checked={showUpload} onChange={e => setShowUpload(e.target.checked)} />
              文件/图片上传
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <input type="checkbox" checked={showAudio} onChange={e => setShowAudio(e.target.checked)} />
              语音输入
            </label>
            <span style={{ color: '#999', fontSize: 13 }}>
              当前模型: <strong>{currentModel.name}</strong>
              {capabilities.image && ' | 支持图片'}
              {capabilities.file && ' | 支持文件'}
            </span>
          </div>
        </div>

        {/* 消息列表 */}
        <div style={{ marginBottom: 24, padding: 16, background: '#fff', borderRadius: 8, minHeight: 200, maxHeight: 500, overflow: 'auto', border: '1px solid #f0f0f0' }}>
          {messages.length === 0 && (
            <div style={{ color: '#999', textAlign: 'center', padding: 40 }}>
              发送消息后，消息气泡将在此展示（支持图片和文件）
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.map(msg => (
              <MessageBubble
                key={msg.id}
                content={msg.content}
                role={msg.role}
                status={msg.status}
                images={msg.images}
                files={msg.files}
              />
            ))}
          </div>
        </div>

        {/* ChatSender 组件 */}
        <div style={{ marginBottom: 24 }}>
          <ChatSender
            loading={loading}
            models={mockModels}
            modelId={selectedModelId}
            onModelChange={setSelectedModelId}
            capabilities={adjustedCapabilities}
            placeholder="输入消息，按 Enter 发送..."
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            onUpload={mockUpload}
          />
        </div>

        {/* 日志区域 */}
        <div style={{ padding: 16, background: '#1e1e1e', borderRadius: 8, maxHeight: 300, overflow: 'auto' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#888', fontSize: 13 }}>事件日志</h4>
          {logs.length === 0 && <div style={{ color: '#666', fontSize: 13 }}>暂无日志，尝试发送消息或上传文件...</div>}
          {logs.map((log, index) => (
            <div key={index} style={{ color: '#4ec9b0', fontSize: 13, lineHeight: 1.6, fontFamily: 'monospace' }}>
              {log}
            </div>
          ))}
        </div>
      </div>
    </ConfigProvider>
  );
}

export default App;

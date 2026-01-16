# Appflow Chat SDK

AI 聊天机器人组件库，提供聊天服务和 UI 组件。

## 安装

### 基础安装

```bash
# 阿里内部
tnpm install @ali/appflow-chat

# NPM 官方
npm install appflow-chat
```

### 安装 Peer Dependencies

本 SDK 需要以下 peer dependencies，请确保你的项目中已安装：

```bash
npm install react react-dom antd
```

| 依赖 | 说明 |
|-----|------|
| `react` | React 核心库 |
| `react-dom` | React DOM 渲染 |
| `antd` | Ant Design UI 组件库 |

## 快速开始

### 1. 初始化服务

```typescript
import { chatService } from '@ali/appflow-chat';

// 初始化
const config = await chatService.setup({
  integrateId: 'your-integrate-id',
  domain: 'https://your-domain.com',
  access_session_token: 'optional-token'
});

console.log('欢迎语:', config.welcome);
console.log('推荐问题:', config.questions);
```

### 2. 发送消息

```typescript
// 发送文本消息
chatService.chat({ text: '你好' })
  .onMessage((content, done, meta) => {
    console.log('AI回复:', content);
    if (done) {
      console.log('回复完成');
    }
  })
  .onError((error) => {
    console.error('错误:', error);
  });
```

### 3. 使用 UI 组件

```tsx
import { MessageBubble, RichMessageBubble } from '@ali/appflow-chat';

// 简单消息气泡
<MessageBubble 
  content="这是AI的回复，支持**Markdown**格式"
  role="bot"
  status="Success"
/>

// 富文本消息气泡（支持图表、表格等）
<RichMessageBubble 
  content={richContent}
  messageType="rich"
  status="Success"
/>
```

### 4. 使用 MarkdownView 组件

```tsx
import { MarkdownView } from '@ali/appflow-chat';

// 渲染 Markdown 内容
<MarkdownView 
  content="# 标题\n\n这是一段 **Markdown** 内容，支持：\n- 代码高亮\n- 数学公式\n- 图表渲染"
  waitingMessage="正在思考..."
/>
```

### 5. 使用 Core 组件（高级定制）

```tsx
import { BubbleContent, SourceContent } from '@ali/appflow-chat';

// 自定义消息气泡
<div className="my-bubble">
  <BubbleContent content={content} status={status}>
    {/* 自定义参考资料组件 */}
    <SourceContent items={references} />
  </BubbleContent>
</div>
```

## API 文档

### ChatService

| 方法 | 说明 |
|-----|------|
| `setup(config)` | 初始化 SDK |
| `chat(message)` | 发送消息 |
| `upload(file)` | 上传文件 |
| `cancel()` | 取消当前请求 |
| `clear()` | 清除会话 |
| `getHistory(sessionId?)` | 获取历史记录 |
| `getSessions()` | 获取会话列表 |
| `sendEventCallback(data)` | 发送事件回调（用于 humanVerify 等场景） |
| `submitHumanVerify(data)` | 提交人工审核结果（sendEventCallback 的便捷封装） |

### UI 组件

| 组件 | 说明 |
|-----|------|
| `MarkdownRenderer` | Markdown 渲染组件（带交互） |
| `MessageBubble` | 消息气泡组件 |
| `RichMessageBubble` | 富文本消息气泡组件 |
| `DocReferences` | 参考资料组件 |
| `WebSearchPanel` | 网页搜索结果面板 |
| `HumanVerify` | 人工审核表单组件 |
| `HistoryCard` | 历史审核记录卡片组件 |
| `CustomParamsRenderer` | 自定义参数渲染器组件 |

### Markdown 组件

| 组件 | 说明 |
|-----|------|
| `MarkdownView` | Markdown 渲染核心组件，支持代码高亮、数学公式、图表等 |

### Core 组件

| 组件 | 说明 |
|-----|------|
| `BubbleContent` | 气泡内容核心组件 |
| `RichBubbleContent` | 富文本气泡内容核心组件 |
| `SourceContent` | 参考资料核心组件 |
| `WebSearchContent` | 网页搜索核心组件 |

## 项目结构

```
src/
├── index.ts                 # 入口文件
├── services/
│   └── ChatService.ts       # 聊天服务
├── components/              # SDK 组件（简化接口）
│   ├── MarkdownRenderer.tsx
│   ├── MessageBubble.tsx
│   ├── RichMessageBubble.tsx
│   ├── DocReferences.tsx
│   ├── WebSearchPanel.tsx
│   └── HumanVerify/         # 人工审核组件
│       ├── HumanVerify.tsx
│       ├── HistoryCard.tsx
│       └── CustomParamsRenderer/
├── core/                    # Core 组件（纯展示）
│   ├── BubbleContent.tsx
│   ├── RichBubbleContent.tsx
│   ├── SourceContent.tsx
│   └── WebSearchContent.tsx
├── markdown/                # Markdown 渲染
│   ├── index.tsx            # MarkdownView 组件
│   └── ...
├── hooks/
│   └── usePreSignUpload.ts
└── utils/
    └── loadEcharts.ts
```

## License

MIT

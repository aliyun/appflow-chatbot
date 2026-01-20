# Appflow Chat SDK

AI chatbot component library providing chat services and UI components.

[中文文档](./README-ZH.md)

## Installation

### Basic Installation

```bash
npm install @alicloud/appflow-chat
```

### Install Peer Dependencies

This SDK requires the following peer dependencies. Please ensure they are installed in your project:

```bash
npm install react react-dom antd
```

| Dependency | Description |
|-----|------|
| `react` | React core library |
| `react-dom` | React DOM rendering |
| `antd` | Ant Design UI component library |

## Quick Start

### 1. Initialize Service

```typescript
import { chatService } from '@alicloud/appflow-chat';

// Initialize
const config = await chatService.setup({
  integrateId: 'your-integrate-id',
  domain: 'https://your-domain.com',
  access_session_token: 'optional-token'
});

console.log('Welcome message:', config.welcome);
console.log('Suggested questions:', config.questions);
```

### 2. Send Messages

```typescript
// Send text message
chatService.chat({ text: 'Hello' })
  .onMessage((content, done, meta) => {
    console.log('AI response:', content);
    if (done) {
      console.log('Response complete');
    }
  })
  .onError((error) => {
    console.error('Error:', error);
  });
```

### 3. Use UI Components

```tsx
import { MessageBubble, RichMessageBubble } from '@alicloud/appflow-chat';

// Simple message bubble
<MessageBubble 
  content="This is AI response, supports **Markdown** format"
  role="bot"
  status="Success"
/>

// Rich text message bubble (supports charts, tables, etc.)
<RichMessageBubble 
  content={richContent}
  messageType="rich"
  status="Success"
/>
```

### 4. Use MarkdownView Component

```tsx
import { MarkdownView } from '@alicloud/appflow-chat';

// Render Markdown content
<MarkdownView 
  content="# Title\n\nThis is **Markdown** content, supports:\n- Code highlighting\n- Math formulas\n- Chart rendering"
  waitingMessage="Thinking..."
/>
```

### 5. Use Core Components (Advanced Customization)

```tsx
import { BubbleContent, SourceContent } from '@alicloud/appflow-chat';

// Custom message bubble
<div className="my-bubble">
  <BubbleContent content={content} status={status}>
    {/* Custom reference component */}
    <SourceContent items={references} />
  </BubbleContent>
</div>
```

## API Documentation

### ChatService

| Method | Description |
|-----|------|
| `setup(config)` | Initialize SDK |
| `chat(message)` | Send message |
| `upload(file)` | Upload file |
| `cancel()` | Cancel current request |
| `clear()` | Clear session |
| `getHistory(sessionId?)` | Get chat history |
| `getSessions()` | Get session list |
| `sendEventCallback(data)` | Send event callback (for humanVerify, cardCallBack, etc.) |
| `submitHumanVerify(data)` | Submit human verification result (convenience wrapper for sendEventCallback) |

### UI Components

| Component | Description |
|-----|------|
| `MarkdownRenderer` | Markdown rendering component (with interactions) |
| `MessageBubble` | Message bubble component |
| `RichMessageBubble` | Rich text message bubble component |
| `DocReferences` | Document references component |
| `WebSearchPanel` | Web search results panel |
| `HumanVerify` | Human verification form component |
| `HistoryCard` | History card component for approval records |
| `CustomParamsRenderer` | Custom parameters renderer component |

### Markdown Components

| Component | Description |
|-----|------|
| `MarkdownView` | Core Markdown rendering component, supports code highlighting, math formulas, charts, etc. |

### Core Components

| Component | Description |
|-----|------|
| `BubbleContent` | Core bubble content component |
| `RichBubbleContent` | Core rich text bubble content component |
| `SourceContent` | Core reference content component |
| `WebSearchContent` | Core web search content component |

## Project Structure

```
src/
├── index.ts                 # Entry file
├── services/
│   └── ChatService.ts       # Chat service
├── components/              # SDK components (simplified interface)
│   ├── MarkdownRenderer.tsx
│   ├── MessageBubble.tsx
│   ├── RichMessageBubble.tsx
│   ├── DocReferences.tsx
│   ├── WebSearchPanel.tsx
│   └── HumanVerify/         # Human verification components
│       ├── HumanVerify.tsx
│       ├── HistoryCard.tsx
│       └── CustomParamsRenderer/
├── core/                    # Core components (pure display)
│   ├── BubbleContent.tsx
│   ├── RichBubbleContent.tsx
│   ├── SourceContent.tsx
│   └── WebSearchContent.tsx
├── markdown/                # Markdown rendering
│   ├── index.tsx            # MarkdownView component
│   └── ...
├── hooks/
│   └── usePreSignUpload.ts
└── utils/
    └── loadEcharts.ts
```

## License

MIT

/**
 * Main export file for the ChatWidget component
 */

export { ChatWidget } from './ChatWidget';
export { ChatBubble } from './ChatBubble';
export { ChatWindow } from './ChatWindow';
export { ChatMessage } from './ChatMessage';
export { ChatInput } from './ChatInput';
export { ChatApi } from './chatApi';

// Export types
export type {
  ChatMessage as ChatMessageType,
  ChatState,
  ChatWidgetProps,
  ChatApiResponse,
  ChatApiRequest,
  QuickAction,
  ChatMessageProps,
  ChatInputProps
} from './types';

// Default export
export { ChatWidget as default } from './ChatWidget';

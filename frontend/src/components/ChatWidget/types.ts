/**
 * Types and interfaces for the chat widget.
 */

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatState {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  sessionId: string | null;
  error: string | null;
}

export interface ChatApiResponse {
  reply: string;
  session_id: string;
  timestamp: string;
}

export interface ChatApiRequest {
  message: string;
  session_id?: string | null;
}

export interface QuickAction {
  label: string;
  prompt: string;
}

export interface ChatWidgetProps {
  apiBaseUrl?: string;
  position?: 'bottom-right' | 'bottom-left';
  theme?: 'light' | 'dark';
  assistantName?: string;
  assistantSubtitle?: string;
  assistantAvatar?: string;
  bubbleLabel?: string;
  welcomeMessage?: string;
  placeholder?: string;
  footerText?: string;
  quickActions?: QuickAction[];
  storageKey?: string;
  maxHeight?: number;
  maxWidth?: number;
}

export interface ChatMessageProps {
  message: ChatMessage;
  assistantName: string;
  assistantAvatar: string;
  isLatest?: boolean;
}

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

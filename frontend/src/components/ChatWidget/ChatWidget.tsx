import React, { useEffect, useState, useCallback } from 'react';
import { ChatBubble } from './ChatBubble';
import { ChatWindow } from './ChatWindow';
import { ChatApi } from './chatApi';
import { ChatState, ChatMessage, ChatWidgetProps, QuickAction } from './types';
import './ChatWidget.css';

const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  { label: 'About', prompt: 'Tell me about the person behind this site.' },
  { label: 'Projects', prompt: 'What projects or work should I look at first?' },
  { label: 'Contact', prompt: 'What is the best way to get in touch?' },
];

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  apiBaseUrl = '/api',
  position = 'bottom-right',
  theme = 'light',
  assistantName = 'Site Assistant',
  assistantSubtitle = 'Answers based on your site knowledge',
  assistantAvatar = 'AI',
  bubbleLabel,
  welcomeMessage = 'Hi, I can help visitors learn about this site, the person behind it, and the projects or work featured here.',
  placeholder = 'Ask a question...',
  footerText = 'Powered by your configured knowledge base',
  quickActions = DEFAULT_QUICK_ACTIONS,
  storageKey = 'personal-site-chatbot',
  maxHeight = 640,
  maxWidth = 420,
}) => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isOpen: false,
    isLoading: false,
    sessionId: null,
    error: null,
  });

  const [chatApi] = useState(() => new ChatApi(apiBaseUrl));
  const sessionStorageKey = `${storageKey}:session_id`;
  const messagesStorageKey = `${storageKey}:messages`;

  useEffect(() => {
    const savedSessionId = localStorage.getItem(sessionStorageKey);
    const savedMessages = localStorage.getItem(messagesStorageKey);

    if (savedSessionId) {
      setChatState((prev) => ({ ...prev, sessionId: savedSessionId }));
    }

    if (savedMessages) {
      try {
        const messages = JSON.parse(savedMessages).map((msg: ChatMessage) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setChatState((prev) => ({ ...prev, messages }));
      } catch (error) {
        console.warn('Failed to parse saved messages:', error);
        localStorage.removeItem(messagesStorageKey);
      }
    }
  }, [messagesStorageKey, sessionStorageKey]);

  useEffect(() => {
    if (chatState.messages.length > 0) {
      localStorage.setItem(messagesStorageKey, JSON.stringify(chatState.messages));
      return;
    }

    localStorage.removeItem(messagesStorageKey);
  }, [chatState.messages, messagesStorageKey]);

  useEffect(() => {
    if (chatState.sessionId) {
      localStorage.setItem(sessionStorageKey, chatState.sessionId);
      return;
    }

    localStorage.removeItem(sessionStorageKey);
  }, [chatState.sessionId, sessionStorageKey]);

  const toggleChat = useCallback(() => {
    setChatState((prev) => ({
      ...prev,
      isOpen: !prev.isOpen,
      error: null,
    }));
  }, []);

  const clearError = useCallback(() => {
    setChatState((prev) => ({ ...prev, error: null }));
  }, []);

  const sendMessage = useCallback(
    async (messageContent: string) => {
      const userMessage: ChatMessage = {
        role: 'user',
        content: messageContent,
        timestamp: new Date(),
      };

      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true,
        error: null,
      }));

      try {
        const response = await chatApi.sendMessage({
          message: messageContent,
          session_id: chatState.sessionId,
        });

        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.reply,
          timestamp: new Date(),
        };

        setChatState((prev) => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          sessionId: response.sessionId || prev.sessionId,
          isLoading: false,
        }));
      } catch (error) {
        console.error('Chat API error:', error);
        setChatState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to send message',
        }));
      }
    },
    [chatApi, chatState.sessionId]
  );

  const resetChat = useCallback(async () => {
    if (chatState.sessionId) {
      try {
        await chatApi.resetSession(chatState.sessionId);
      } catch (error) {
        console.error('Reset error:', error);
        setChatState((prev) => ({
          ...prev,
          error: 'Failed to reset conversation',
        }));
        return;
      }
    }

    setChatState((prev) => ({
      ...prev,
      messages: [],
      sessionId: null,
      error: null,
    }));
  }, [chatApi, chatState.sessionId]);

  const closeChat = useCallback(() => {
    setChatState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  useEffect(() => {
    return () => {
      chatApi.cancelRequest();
    };
  }, [chatApi]);

  const widgetStyle = {
    '--chat-max-width': `${maxWidth}px`,
    '--chat-max-height': `${maxHeight}px`,
  } as React.CSSProperties;

  return (
    <div
      className={`chat-widget-container ${position} ${theme}`}
      style={widgetStyle}
      role="region"
      aria-label={`${assistantName} chat widget`}
    >
      <ChatWindow
        isOpen={chatState.isOpen}
        messages={chatState.messages}
        onSendMessage={sendMessage}
        onClose={closeChat}
        onReset={resetChat}
        onDismissError={clearError}
        isLoading={chatState.isLoading}
        error={chatState.error}
        assistantName={assistantName}
        assistantSubtitle={assistantSubtitle}
        assistantAvatar={assistantAvatar}
        welcomeMessage={welcomeMessage}
        placeholder={placeholder}
        footerText={footerText}
        quickActions={quickActions}
      />

      <ChatBubble
        isOpen={chatState.isOpen}
        onClick={toggleChat}
        hasUnread={false}
        isLoading={chatState.isLoading}
        label={bubbleLabel || `Chat with ${assistantName}`}
      />
    </div>
  );
};

export default ChatWidget;

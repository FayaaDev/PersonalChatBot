import React, { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatMessage as ChatMessageType, QuickAction } from './types';
import './ChatWidget.css';

interface ChatWindowProps {
  isOpen: boolean;
  messages: ChatMessageType[];
  onSendMessage: (message: string) => void;
  onClose: () => void;
  onReset: () => void;
  onDismissError: () => void;
  isLoading: boolean;
  error: string | null;
  assistantName: string;
  assistantSubtitle: string;
  assistantAvatar: string;
  welcomeMessage: string;
  placeholder: string;
  footerText: string;
  quickActions: QuickAction[];
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  isOpen,
  messages,
  onSendMessage,
  onClose,
  onReset,
  onDismissError,
  isLoading,
  error,
  assistantName,
  assistantSubtitle,
  assistantAvatar,
  welcomeMessage,
  placeholder,
  footerText,
  quickActions,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages, isOpen, error]);

  if (!isOpen) {
    return null;
  }

  const hasMessages = messages.length > 0;

  return (
    <div className="chat-window" role="dialog" aria-label={`Chat with ${assistantName}`} aria-modal="true">
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-header-avatar" aria-hidden="true">{assistantAvatar}</div>
          <div className="chat-header-text">
            <h3 className="chat-header-title">{assistantName}</h3>
            <span className="chat-header-status">
              <span className="chat-status-indicator online" />
              {assistantSubtitle}
            </span>
          </div>
        </div>

        <div className="chat-header-actions">
          <button
            className="chat-action-button"
            onClick={onReset}
            aria-label="Reset conversation"
            title="Reset conversation"
            disabled={isLoading || !hasMessages}
          >
            ↺
          </button>

          <button
            className="chat-action-button close"
            onClick={onClose}
            aria-label="Close chat"
            title="Close chat"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="chat-messages" role="log" aria-live="polite" aria-label="Chat messages">
        {!hasMessages && (
          <div className="chat-welcome">
            <div className="chat-welcome-avatar" aria-hidden="true">{assistantAvatar}</div>
            <div className="chat-welcome-message">
              <p>{welcomeMessage}</p>
              {quickActions.length > 0 && (
                <div className="chat-quick-actions">
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      className="chat-quick-button"
                      onClick={() => onSendMessage(action.prompt)}
                      disabled={isLoading}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <ChatMessage
            key={`${message.timestamp.getTime()}-${index}`}
            message={message}
            assistantName={assistantName}
            assistantAvatar={assistantAvatar}
            isLatest={index === messages.length - 1}
          />
        ))}

        {isLoading && (
          <div className="chat-message assistant">
            <div className="chat-message-content">
              <div className="chat-message-avatar">
                <div className="bot-avatar">{assistantAvatar}</div>
              </div>
              <div className="chat-message-bubble">
                <div className="chat-typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="chat-error" role="alert">
            <div className="chat-error-icon">!</div>
            <div className="chat-error-message">
              <p>{error}</p>
              <button className="chat-retry-button" onClick={onDismissError}>
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-footer">
        <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} placeholder={placeholder} />
        <div className="chat-footer-info">{footerText}</div>
      </div>
    </div>
  );
};

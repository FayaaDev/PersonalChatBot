import React from 'react';
import { ChatMessageProps } from './types';
import './ChatWidget.css';

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  assistantName,
  assistantAvatar,
}) => {
  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isUser = message.role === 'user';

  return (
    <div
      className={`chat-message ${isUser ? 'user' : 'assistant'}`}
      role="article"
      aria-label={`${isUser ? 'Your' : `${assistantName}'s`} message`}
    >
      <div className="chat-message-content">
        <div className="chat-message-avatar">
          {isUser ? <div className="user-avatar">You</div> : <div className="bot-avatar">{assistantAvatar}</div>}
        </div>

        <div className="chat-message-bubble">
          <div className="chat-message-text">{message.content}</div>
          <div className="chat-message-time">{formatTime(message.timestamp)}</div>
        </div>
      </div>
    </div>
  );
};

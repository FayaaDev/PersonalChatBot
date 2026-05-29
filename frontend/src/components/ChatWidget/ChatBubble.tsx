import React from 'react';
import './ChatWidget.css';

interface ChatBubbleProps {
  isOpen: boolean;
  onClick: () => void;
  hasUnread?: boolean;
  isLoading?: boolean;
  label: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  isOpen,
  onClick,
  hasUnread = false,
  isLoading = false,
  label,
}) => {
  return (
    <button
      className={`chat-bubble ${isOpen ? 'open' : ''} ${hasUnread ? 'unread' : ''}`}
      onClick={onClick}
      aria-label={isOpen ? 'Close chat' : label}
      aria-expanded={isOpen}
    >
      <div className="chat-bubble-content">
        {isOpen ? (
          <div className="chat-bubble-close">✕</div>
        ) : (
          <>
            <div className="chat-bubble-icon">✦</div>
            {hasUnread && <div className="chat-bubble-unread-dot" aria-label="New message" />}
            {isLoading && <div className="chat-bubble-loading" />}
          </>
        )}
      </div>

      {!isOpen && <div className="chat-bubble-tooltip">{label}</div>}

      <div className="chat-bubble-pulse" />
    </button>
  );
};

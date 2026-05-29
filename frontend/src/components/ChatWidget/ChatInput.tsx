import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { ChatInputProps } from './types';
import './ChatWidget.css';

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  placeholder = 'Ask a question...',
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !isLoading) {
      onSendMessage(trimmedMessage);
      setMessage('');

      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div className="chat-input-container">
      <div className="chat-input-wrapper">
        <textarea
          ref={textareaRef}
          className="chat-input-textarea"
          placeholder={placeholder}
          value={message}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyPress}
          disabled={isLoading}
          rows={1}
          aria-label="Type your message"
        />

        <button
          className={`chat-send-button ${!message.trim() || isLoading ? 'disabled' : ''}`}
          onClick={handleSend}
          disabled={!message.trim() || isLoading}
          aria-label="Send message"
          title="Send message"
        >
          {isLoading ? <div className="chat-loading-spinner">⋯</div> : <div className="chat-send-icon">➜</div>}
        </button>
      </div>

      <div className="chat-input-hint">
        Press <kbd>Enter</kbd> to send and <kbd>Shift</kbd> + <kbd>Enter</kbd> for a new line
      </div>
    </div>
  );
};

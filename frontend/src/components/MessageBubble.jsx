import React from 'react';

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const MessageBubble = ({ message, isOwnMessage, showSenderName }) => {
  return (
    <div className={`message-row ${isOwnMessage ? 'message-row--own' : ''}`}>
      <div className={`message-bubble ${isOwnMessage ? 'message-bubble--own' : ''}`}>
        {showSenderName && !isOwnMessage && (
          <span className="message-bubble__sender">{message.sender?.username}</span>
        )}
        <p className="message-bubble__content">{message.content}</p>
        <span className="message-bubble__time">{formatTime(message.createdAt)}</span>
      </div>
    </div>
  );
};

export default MessageBubble;
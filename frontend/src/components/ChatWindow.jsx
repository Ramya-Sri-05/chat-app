import React, { useEffect, useRef, useState } from 'react';
import MessageBubble from './MessageBubble';
import OnlineStatusDot from './OnlineStatusDot';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const ChatWindow = ({ activeChat, messages, onSendMessage }) => {
  const { user } = useAuth();
  const { socket, onlineUserIds } = useSocket();
  const [text, setText] = useState('');
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handleTyping = ({ userId, roomId }) => {
      if (!activeChat) return;
      if (activeChat.type === 'room' && roomId === activeChat.id) {
        setTypingUser(userId);
      } else if (activeChat.type === 'direct' && userId === activeChat.id) {
        setTypingUser(userId);
      }
    };

    const handleStopTyping = () => setTypingUser(null);

    socket.on('userTyping', handleTyping);
    socket.on('userStopTyping', handleStopTyping);

    return () => {
      socket.off('userTyping', handleTyping);
      socket.off('userStopTyping', handleStopTyping);
    };
  }, [socket, activeChat]);

  const handleTypingEmit = () => {
    if (!socket || !activeChat) return;

    const payload =
      activeChat.type === 'room' ? { roomId: activeChat.id } : { receiverId: activeChat.id };

    socket.emit('typing', payload);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', payload);
    }, 1500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text.trim());
    setText('');
  };

  if (!activeChat) {
    return (
      <div className="chat-window chat-window--empty">
        <p>Select a room or a user to start chatting </p>
      </div>
    );
  }

  const isDirectOnline =
    activeChat.type === 'direct' && onlineUserIds.includes(activeChat.id);

  return (
    <div className="chat-window">
      <div className="chat-window__header">
        <div>
          <h3>
            {activeChat.type === 'room' ? `# ${activeChat.name}` : activeChat.name}
          </h3>
          {activeChat.type === 'direct' && (
            <span className="chat-window__status">
              <OnlineStatusDot isOnline={isDirectOnline} />{' '}
              {isDirectOnline ? 'Online' : 'Offline'}
            </span>
          )}
        </div>
      </div>

      <div className="chat-window__messages">
        {messages.length === 0 && (
          <p className="chat-window__empty-msg">No messages yet. Say hello 👋</p>
        )}
        {messages.map((msg, idx) => {
          const isOwnMessage = msg.sender?._id === user.id;
          const prevMsg = messages[idx - 1];
          const showSenderName =
            activeChat.type === 'room' &&
            (!prevMsg || prevMsg.sender?._id !== msg.sender?._id);

          return (
            <MessageBubble
              key={msg._id || idx}
              message={msg}
              isOwnMessage={isOwnMessage}
              showSenderName={showSenderName}
            />
          );
        })}
        {typingUser && typingUser !== user.id && (
          <p className="typing-indicator">Typing...</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-window__input-bar" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleTypingEmit();
          }}
        />
        <button type="submit" className="btn btn--primary" disabled={!text.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
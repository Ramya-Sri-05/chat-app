import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../components/Navbar';
import RoomList from '../components/RoomList';
import UserList from '../components/UserList';
import ChatWindow from '../components/ChatWindow';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  getRooms,
  createRoom as createRoomApi,
  joinRoom as joinRoomApi,
  getAllUsers,
  getRoomMessages,
  getDirectMessages,
} from '../utils/api';

const ChatPage = () => {
  const { user } = useAuth();
  const { socket, onlineUserIds } = useSocket();

  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // { type: 'room' | 'direct', id, name }
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [roomsRes, usersRes] = await Promise.all([getRooms(), getAllUsers()]);
        setRooms(roomsRes.data.rooms);
        setUsers(usersRes.data.users);
      } catch (err) {
        console.error('Failed to load initial chat data:', err.message);
      }
    };
    loadInitialData();
  }, []);

  // Listen for incoming room / direct messages globally
  useEffect(() => {
    if (!socket) return;

    const handleNewRoomMessage = (message) => {
      setActiveChat((current) => {
        if (current?.type === 'room' && current.id === message.room) {
          setMessages((prev) => [...prev, message]);
        }
        return current;
      });
    };

    const handleNewDirectMessage = (message) => {
      setActiveChat((current) => {
        if (!current || current.type !== 'direct') return current;

        const otherPartyId =
          message.sender._id === user.id ? message.receiver._id : message.sender._id;

        if (otherPartyId === current.id) {
          setMessages((prev) => [...prev, message]);
        }
        return current;
      });
    };

    socket.on('newRoomMessage', handleNewRoomMessage);
    socket.on('newDirectMessage', handleNewDirectMessage);

    return () => {
      socket.off('newRoomMessage', handleNewRoomMessage);
      socket.off('newDirectMessage', handleNewDirectMessage);
    };
  }, [socket, user.id]);

  const handleSelectRoom = useCallback(
    async (room) => {
      if (!socket) return;

      // Leave previous room if any
      if (activeChat?.type === 'room') {
        socket.emit('leaveRoom', activeChat.id);
      }

      socket.emit('joinRoom', room._id);
      setActiveChat({ type: 'room', id: room._id, name: room.name });
      setLoadingMessages(true);

      try {
        const res = await getRoomMessages(room._id);
        setMessages(res.data.messages);
      } catch (err) {
        console.error('Failed to load room messages:', err.message);
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    },
    [socket, activeChat]
  );

  const handleSelectUser = useCallback(
    async (otherUser) => {
      if (activeChat?.type === 'room' && socket) {
        socket.emit('leaveRoom', activeChat.id);
      }

      setActiveChat({ type: 'direct', id: otherUser._id, name: otherUser.username });
      setLoadingMessages(true);

      try {
        const res = await getDirectMessages(otherUser._id);
        setMessages(res.data.messages);
      } catch (err) {
        console.error('Failed to load direct messages:', err.message);
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    },
    [socket, activeChat]
  );

  const handleCreateRoom = async (name, description) => {
    try {
      const res = await createRoomApi({ name, description });
      setRooms((prev) => [res.data.room, ...prev]);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to create room',
      };
    }
  };

  const handleSendMessage = (content) => {
    if (!socket || !activeChat) return;

    if (activeChat.type === 'room') {
      socket.emit('sendRoomMessage', { roomId: activeChat.id, content });
    } else {
      socket.emit('sendDirectMessage', { receiverId: activeChat.id, content });
    }
  };

  return (
    <div className="chat-page">
      <Navbar />
      <div className="chat-layout">
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen((s) => !s)}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>

        <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
          <RoomList
            rooms={rooms}
            activeChat={activeChat}
            onSelectRoom={(room) => {
              handleSelectRoom(room);
              setSidebarOpen(false);
            }}
            onCreateRoom={handleCreateRoom}
          />
          <UserList
            users={users}
            activeChat={activeChat}
            onlineUserIds={onlineUserIds}
            onSelectUser={(u) => {
              handleSelectUser(u);
              setSidebarOpen(false);
            }}
          />
        </aside>

        <main className="chat-main">
          {loadingMessages ? (
            <div className="chat-window chat-window--empty">
              <div className="spinner" />
            </div>
          ) : (
            <ChatWindow
              activeChat={activeChat}
              messages={messages}
              onSendMessage={handleSendMessage}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default ChatPage;
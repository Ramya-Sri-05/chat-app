const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { saveMessage } = require('../controllers/messageController');

// Map<userId, Set<socketId>>  -> supports multiple tabs/devices per user
const onlineUsers = new Map();

const addOnlineUser = (userId, socketId) => {
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }
  onlineUsers.get(userId).add(socketId);
};

const removeOnlineUser = (userId, socketId) => {
  if (onlineUsers.has(userId)) {
    onlineUsers.get(userId).delete(socketId);
    if (onlineUsers.get(userId).size === 0) {
      onlineUsers.delete(userId);
    }
  }
};

const isUserOnline = (userId) => onlineUsers.has(userId);

const initSocket = (io) => {
  // Authenticate every socket connection using the JWT sent from the client
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication error: token missing'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Authentication error: invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    console.log(`🔌 Socket connected: ${socket.id} (user: ${userId})`);

    try {
      // Track this connection and mark user online
      addOnlineUser(userId, socket.id);

      // Join a personal room named after the userId — this lets us send
      // direct messages / notifications to a user regardless of which
      // socket/tab they're using.
      socket.join(userId);

      await User.findByIdAndUpdate(userId, { isOnline: true });

      // Notify everyone this user is now online
      io.emit('userStatusChanged', { userId, isOnline: true });

      // Send the current full online users list to the newly connected client
      socket.emit('onlineUsersList', Array.from(onlineUsers.keys()));
    } catch (error) {
      console.error('Socket connection setup error:', error.message);
    }

    // ---- Room chat ----
    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
    });

    socket.on('leaveRoom', (roomId) => {
      socket.leave(roomId);
    });

    socket.on('sendRoomMessage', async ({ roomId, content }) => {
      try {
        if (!roomId || !content?.trim()) return;

        const message = await saveMessage({
          senderId: userId,
          roomId,
          content: content.trim(),
        });

        io.to(roomId).emit('newRoomMessage', message);
      } catch (error) {
        console.error('sendRoomMessage error:', error.message);
        socket.emit('errorMessage', { message: 'Failed to send room message' });
      }
    });

    // ---- One-to-one chat ----
    socket.on('sendDirectMessage', async ({ receiverId, content }) => {
      try {
        if (!receiverId || !content?.trim()) return;

        const message = await saveMessage({
          senderId: userId,
          receiverId,
          content: content.trim(),
        });

        // Deliver to receiver's personal room and echo back to sender
        io.to(receiverId).emit('newDirectMessage', message);
        io.to(userId).emit('newDirectMessage', message);
      } catch (error) {
        console.error('sendDirectMessage error:', error.message);
        socket.emit('errorMessage', { message: 'Failed to send direct message' });
      }
    });

    // ---- Typing indicators ----
    socket.on('typing', ({ roomId, receiverId }) => {
      if (roomId) {
        socket.to(roomId).emit('userTyping', { userId, roomId });
      } else if (receiverId) {
        io.to(receiverId).emit('userTyping', { userId });
      }
    });

    socket.on('stopTyping', ({ roomId, receiverId }) => {
      if (roomId) {
        socket.to(roomId).emit('userStopTyping', { userId, roomId });
      } else if (receiverId) {
        io.to(receiverId).emit('userStopTyping', { userId });
      }
    });

    // ---- Disconnect ----
    socket.on('disconnect', async () => {
      console.log(`❌ Socket disconnected: ${socket.id} (user: ${userId})`);
      removeOnlineUser(userId, socket.id);

      // Only mark the user offline if they have no other active sockets
      if (!isUserOnline(userId)) {
        try {
          await User.findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeen: new Date(),
          });
          io.emit('userStatusChanged', { userId, isOnline: false, lastSeen: new Date() });
        } catch (error) {
          console.error('Disconnect update error:', error.message);
        }
      }
    });
  });
};

module.exports = { initSocket, isUserOnline };
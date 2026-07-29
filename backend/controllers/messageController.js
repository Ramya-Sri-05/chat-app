const Message = require('../models/Message');
const Room = require('../models/Room');

// @route GET /api/messages/room/:roomId (protected) - room chat history
const getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const messages = await Message.find({ room: roomId })
      .populate('sender', 'username avatar')
      .sort({ createdAt: 1 });

    return res.status(200).json({ messages });
  } catch (error) {
    console.error('GetRoomMessages error:', error.message);
    return res.status(500).json({ message: 'Server error while fetching room messages' });
  }
};

// @route GET /api/messages/direct/:userId (protected) - 1-to-1 chat history
const getDirectMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: userId },
        { sender: userId, receiver: myId },
      ],
    })
      .populate('sender', 'username avatar')
      .populate('receiver', 'username avatar')
      .sort({ createdAt: 1 });

    return res.status(200).json({ messages });
  } catch (error) {
    console.error('GetDirectMessages error:', error.message);
    return res.status(500).json({ message: 'Server error while fetching direct messages' });
  }
};

// Helper used by socketHandler to persist messages (kept here so REST and
// sockets share the same persistence logic and stay consistent).
const saveMessage = async ({ senderId, roomId = null, receiverId = null, content }) => {
  const message = await Message.create({
    sender: senderId,
    room: roomId,
    receiver: receiverId,
    content,
  });

  const populatedMessage = await Message.findById(message._id)
    .populate('sender', 'username avatar')
    .populate('receiver', 'username avatar');

  return populatedMessage;
};

module.exports = { getRoomMessages, getDirectMessages, saveMessage };
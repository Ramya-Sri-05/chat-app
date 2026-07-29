const Room = require('../models/Room');

// @route POST /api/rooms (protected)
const createRoom = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Room name is required' });
    }

    const existingRoom = await Room.findOne({ name });
    if (existingRoom) {
      return res.status(409).json({ message: 'A room with this name already exists' });
    }

    const room = await Room.create({
      name,
      description: description || '',
      isGroup: true,
      members: [req.user.id],
      createdBy: req.user.id,
    });

    return res.status(201).json({ message: 'Room created successfully', room });
  } catch (error) {
    console.error('CreateRoom error:', error.message);
    return res.status(500).json({ message: 'Server error while creating room' });
  }
};

// @route GET /api/rooms (protected) - list all available rooms
const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate('createdBy', 'username avatar')
      .populate('members', 'username avatar isOnline')
      .sort({ createdAt: -1 });

    return res.status(200).json({ rooms });
  } catch (error) {
    console.error('GetRooms error:', error.message);
    return res.status(500).json({ message: 'Server error while fetching rooms' });
  }
};

// @route GET /api/rooms/:id (protected)
const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('createdBy', 'username avatar')
      .populate('members', 'username avatar isOnline');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    return res.status(200).json({ room });
  } catch (error) {
    console.error('GetRoomById error:', error.message);
    return res.status(500).json({ message: 'Server error while fetching room' });
  }
};

// @route PUT /api/rooms/:id/join (protected)
const joinRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const alreadyMember = room.members.some(
      (memberId) => memberId.toString() === req.user.id
    );

    if (!alreadyMember) {
      room.members.push(req.user.id);
      await room.save();
    }

    const updatedRoom = await Room.findById(req.params.id).populate(
      'members',
      'username avatar isOnline'
    );

    return res.status(200).json({ message: 'Joined room successfully', room: updatedRoom });
  } catch (error) {
    console.error('JoinRoom error:', error.message);
    return res.status(500).json({ message: 'Server error while joining room' });
  }
};

module.exports = { createRoom, getRooms, getRoomById, joinRoom };
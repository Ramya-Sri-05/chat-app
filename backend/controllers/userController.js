const User = require('../models/User');

// @route GET /api/users  (protected) - list all users except self, for 1-to-1 chat
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select('username email avatar isOnline lastSeen')
      .sort({ isOnline: -1, username: 1 });

    return res.status(200).json({ users });
  } catch (error) {
    console.error('GetAllUsers error:', error.message);
    return res.status(500).json({ message: 'Server error while fetching users' });
  }
};

// @route GET /api/users/:id (protected)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      'username email avatar isOnline lastSeen'
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ user });
  } catch (error) {
    console.error('GetUserById error:', error.message);
    return res.status(500).json({ message: 'Server error while fetching user' });
  }
};

module.exports = { getAllUsers, getUserById };
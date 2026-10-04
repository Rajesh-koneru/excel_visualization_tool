const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { isDbConnected } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'excel_visual_analyzer_secret_key_2026_prod';

// Register User
exports.registerUser = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        message:
          'Database offline. Please start local MongoDB (e.g. net start MongoDB or mongod) or configure a MongoDB Atlas MONGODB_URI in backend/.env.',
      });
    }

    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ message: 'Please provide email, password, and username' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email: email.toLowerCase(),
      username: username.trim(),
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id, email: newUser.email, username: newUser.username }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.status(201).json({
      message: 'You are registered successfully',
      user: { id: newUser._id, email: newUser.email, username: newUser.username },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// Login User
exports.loginUser = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        message:
          'Database offline. Please start local MongoDB (e.g. net start MongoDB or mongod) or configure a MongoDB Atlas MONGODB_URI in backend/.env.',
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const token = jwt.sign({ id: user._id, email: user.email, username: user.username }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.status(200).json({
      message: 'Login successfully...',
      user: { id: user._id, email: user.email, username: user.username },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
exports.getMe = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ message: 'Database offline.' });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

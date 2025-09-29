// controllers/userController.js
const express = require('express');
const User = require('../models/Users');
const bcrypt = require('bcrypt');

// Registering user logic
exports.registerUser = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    console.log('the received data...',req.body);

    const existingUser = await User.findOne({ email: email});
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword)
    

    const newUser = new User({email:email,username: username, password: hashedPassword });
    await newUser.save();

    console.log(`${username} registered successfully...`);
    res.status(200).json({ message: `${username} registered successfully` });

  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ msg: 'Server error' });
  }
};

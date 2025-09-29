// backend/routes/main.js
const express = require('express');
const router = express.Router();

const User=require('../models/Users')

router.use(express.json()); // parse JSON

router.post('/getUser', async(req, res) => {
  const { email, password } = req.body;
  console.log("Received:", email, password);
  const Newuser=new User({ Email: email,Username:'rajesh', Password: password })
  await Newuser.save();
  console.log('user registered successfully...')
  res.json({ message: "Success" });
});


router.get('/all', async (req, res) => {
  try {
    const users = await User.find(); // No filter → gets all users
    res.json(users);
    console.log(users);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});
module.exports = router;

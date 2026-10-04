// routes/files.js
const express = require('express');
const router = express.Router();
const ExcelDoc=require('../models/ExcelSchema');

// DELETE /user/deleteFile/:fileName
exports.deleteFile= async (req, res) => {
  const { fileName } = req.params;
  console.log(req.params)

  try {
    const deletedFile = await ExcelDoc.findOneAndDelete({ name: fileName });
    if (!deletedFile) {
      return res.status(404).json({ message: 'File not found' });
    }
    console.log("file deleted...")
    res.status(200).json({ message: 'File deleted successfully', file: deletedFile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

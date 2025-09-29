const express=require('express');
const xlsx = require('xlsx');
const fs = require('fs');
const ExcelDoc=require('../models/ExcelSchema');


exports.ExcelStore=async(req,res)=>{
    
  try {
    const fileBuffer = req.file.buffer;
    const originalFileName = req.file.originalname;

    // Read from buffer instead of file path
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);


    const newDoc = new ExcelDoc({
      fileName: originalFileName,
      data: sheetData
    });

    await newDoc.save();

    res.status(200).json({
      filename: originalFileName,
      data: sheetData,
      message: 'Data saved to the database successfully'
    });
  } catch (err) {
    console.error('Error while parsing/uploading Excel file:', err);
    res.status(500).json({
      message: 'There was an error parsing the data or saving to the database'
    });
  }
};

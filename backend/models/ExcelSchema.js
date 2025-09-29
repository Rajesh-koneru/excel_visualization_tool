const mongoose = require('mongoose');

const excelSchema = new mongoose.Schema({
  fileName: String,
  uploadDate: { type: Date, default: Date.now },
  data: [{}] // array of dynamic objects
});

module.exports = mongoose.model('ExcelDoc', excelSchema);

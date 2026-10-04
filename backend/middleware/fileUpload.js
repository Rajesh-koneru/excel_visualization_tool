const multer = require('multer');

const maxSizeBytes = (parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 10) * 1024 * 1024;

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedExts = ['.xlsx', '.xls', '.csv'];
  const fileName = file.originalname.toLowerCase();
  const isValidExt = allowedExts.some((ext) => fileName.endsWith(ext));

  if (isValidExt) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Only Excel (.xlsx, .xls) and CSV (.csv) files are allowed.'
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: maxSizeBytes,
  },
  fileFilter,
});

module.exports = upload;

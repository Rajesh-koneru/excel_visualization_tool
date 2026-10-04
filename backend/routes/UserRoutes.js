const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const datasetController = require('../controllers/datasetController');
const upload = require('../middleware/fileUpload');
const { authMiddleware } = require('../middleware/auth');

// Legacy & direct routes mapping
router.post('/register', authController.registerUser);
router.post('/Login', authController.loginUser);

router.post('/ExcelUpload', authMiddleware, upload.single('file'), datasetController.uploadExcel);
router.post('/datapreview', datasetController.getDataPreview);
router.get('/FilesData', authMiddleware, datasetController.getFilesData);
router.delete('/delete/:filename', datasetController.deleteFile);
router.get('/demo', datasetController.getDemoDataset);
router.post('/clean/:filename', datasetController.cleanDataset);

module.exports = router;

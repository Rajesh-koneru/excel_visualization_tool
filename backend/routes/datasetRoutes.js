const express = require('express');
const router = express.Router();
const datasetController = require('../controllers/datasetController');
const upload = require('../middleware/fileUpload');
const { authMiddleware } = require('../middleware/auth');

router.post('/upload', authMiddleware, upload.single('file'), datasetController.uploadExcel);
router.get('/', authMiddleware, datasetController.getFilesData);
router.get('/demo', datasetController.getDemoDataset);
router.post('/preview', datasetController.getDataPreview);
router.get('/:id', datasetController.getDatasetById);
router.delete('/:filename', datasetController.deleteFile);
router.post('/:filename/clean', datasetController.cleanDataset);

module.exports = router;

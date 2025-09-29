// routes/UserRoutes.js
const express = require('express');
const router = express.Router(); // ✅ correct way
const { registerUser } = require('../controllers/Register');
const {LoginUser}=require('../controllers/Login')
const {DataPreview}=require('../controllers/DataPreview')
const {FileData}=require('../controllers/DataPreview')
const {ExcelStore}=require('../controllers/ExcelData');
const {deleteFile}=require('../controllers/Delete');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/register', registerUser); // ✅ pass function, do NOT call it
router.post('/Login', LoginUser);
router.post('/datapreview', DataPreview);
router.post('/ExcelUpload', upload.single('file'), ExcelStore);
router.get('/FilesData',FileData);
router.delete('/delete/:filename',deleteFile);
module.exports = router;

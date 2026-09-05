// routes/paperRoutes.js
const express = require('express');
const router = express.Router();
const paperController = require('../controllers/paperController');
const upload = require('../utils/fileUpload');

// POST - Upload and analyze a paper
router.post('/analyze', upload.single('file'), paperController.analyzePaper);

// GET - List all available reports
router.get('/reports', paperController.getReports);

// GET - Download a specific report by filename
router.get('/reports/:filename', paperController.downloadReport);

// GET - Download the master analysis history report
router.get('/master-report', paperController.getMasterReport);

module.exports = router;
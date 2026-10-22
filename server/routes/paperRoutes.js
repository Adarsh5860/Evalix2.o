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

// POST - Dynamically export analysis data to Excel
router.post('/export-excel', paperController.exportExcel);

// POST - Run quality check for a specific report without re-uploading
router.post('/reports/:filename/quality-check', paperController.runQualityCheck);
router.post('/quality-check', paperController.runQualityCheck);

// GET & POST - Get certificate evaluation data
router.get('/reports/:filename/certificate', paperController.getCertificateData);
router.post('/reports/:filename/certificate', paperController.getCertificateData);
router.post('/certificate', paperController.getCertificateData);

// GET - Aggregate dashboard stats
router.get('/stats', paperController.getStats);

module.exports = router;
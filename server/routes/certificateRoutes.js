// server/routes/certificateRoutes.js
const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');

// POST - Create a new certificate for a completed evaluation
router.post('/', certificateController.createCertificate);

// GET - List all generated certificates (history)
router.get('/', certificateController.getCertificates);

// GET - Download certificate PDF by unique ID
router.get('/:certificateId/download', certificateController.downloadCertificate);

// GET - Get certificate details by unique ID
router.get('/:certificateId', certificateController.getCertificateById);

module.exports = router;

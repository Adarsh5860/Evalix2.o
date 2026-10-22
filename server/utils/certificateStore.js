// server/utils/certificateStore.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const CERTIFICATES_FILE = path.join(DATA_DIR, 'certificates.json');

/**
 * Ensure data directory and certificates.json exist
 */
const ensureStore = () => {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(CERTIFICATES_FILE)) {
        fs.writeFileSync(CERTIFICATES_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
};

/**
 * Generate a cryptographically secure, unique certificate ID
 * Format: EVX-YYYY-XXXX-XXXX (e.g. EVX-2026-8A3F-92C1)
 */
const generateCertificateId = () => {
    const year = new Date().getFullYear();
    const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
    return `EVX-${year}-${part1}-${part2}`;
};

/**
 * Read all certificates from disk
 */
const getAllCertificates = () => {
    ensureStore();
    try {
        const raw = fs.readFileSync(CERTIFICATES_FILE, 'utf-8');
        return JSON.parse(raw);
    } catch (err) {
        console.error('Error reading certificates store:', err);
        return [];
    }
};

/**
 * Find a certificate by unique ID
 */
const getCertificateById = (id) => {
    if (!id || typeof id !== 'string') return null;
    const cleanId = id.trim().toUpperCase();
    const all = getAllCertificates();
    return all.find(c => c.id.toUpperCase() === cleanId) || null;
};

/**
 * Save a new certificate record to disk
 */
const saveCertificate = (certificate) => {
    ensureStore();
    const all = getAllCertificates();

    // Ensure unique ID
    let certId = certificate.id || generateCertificateId();
    while (all.some(c => c.id === certId)) {
        certId = generateCertificateId();
    }

    const record = {
        id: certId,
        recipientName: certificate.recipientName.trim(),
        documentTitle: certificate.documentTitle.trim(),
        evaluationReference: certificate.evaluationReference,
        issuedAt: certificate.issuedAt || new Date().toISOString(),
        metrics: certificate.metrics || null,
        qualityScore: certificate.qualityScore || null,
        createdAt: new Date().toISOString()
    };

    all.unshift(record); // newest first
    fs.writeFileSync(CERTIFICATES_FILE, JSON.stringify(all, null, 2), 'utf-8');
    return record;
};

module.exports = {
    generateCertificateId,
    getAllCertificates,
    getCertificateById,
    saveCertificate
};

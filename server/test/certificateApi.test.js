// server/test/certificateApi.test.js
const assert = require('assert');
const certificateController = require('../controllers/certificateController');
const certificateStore = require('../utils/certificateStore');
const certificateGenerator = require('../utils/certificateGenerator');

async function runTests() {
    console.log('--- Starting Certificate Feature Test Suite ---');
    let passed = 0;
    let failed = 0;

    const test = async (name, fn) => {
        try {
            await fn();
            console.log(`✓ [PASS] ${name}`);
            passed++;
        } catch (err) {
            console.error(`✗ [FAIL] ${name}:`, err.message);
            failed++;
        }
    };

    // Test 1: Generate unique Certificate ID format
    await test('Generate unique Certificate ID conforming to EVX-YYYY-XXXX-XXXX', () => {
        const id1 = certificateStore.generateCertificateId();
        const id2 = certificateStore.generateCertificateId();
        assert.match(id1, /^EVX-\d{4}-[A-F0-9]{4}-[A-F0-9]{4}$/);
        assert.notStrictEqual(id1, id2);
    });

    // Test 2: Validation of missing recipient name
    await test('POST /api/certificates rejects empty recipient name with 400', async () => {
        let statusCode = null;
        let responseJson = null;

        const req = { body: { recipientName: '', evaluationReference: 'sample.xlsx' } };
        const res = {
            status: (code) => {
                statusCode = code;
                return { json: (data) => { responseJson = data; } };
            }
        };

        await certificateController.createCertificate(req, res);
        assert.strictEqual(statusCode, 400);
        assert.strictEqual(responseJson.success, false);
        assert.match(responseJson.error, /recipient.*name.*required/i);
    });

    // Test 3: Validation of invalid recipient name characters
    await test('POST /api/certificates rejects unsafe / invalid recipient name with 400', async () => {
        let statusCode = null;
        let responseJson = null;

        const req = { body: { recipientName: '<script>alert(1)</script>', evaluationReference: 'sample.xlsx' } };
        const res = {
            status: (code) => {
                statusCode = code;
                return { json: (data) => { responseJson = data; } };
            }
        };

        await certificateController.createCertificate(req, res);
        assert.strictEqual(statusCode, 400);
        assert.strictEqual(responseJson.success, false);
    });

    // Test 4: Rejects nonexistent evaluation reference
    await test('POST /api/certificates rejects nonexistent evaluation with 404', async () => {
        let statusCode = null;
        let responseJson = null;

        const req = { body: { recipientName: 'Dr. Jane Smith', evaluationReference: 'non_existent_fake_report.xlsx' } };
        const res = {
            status: (code) => {
                statusCode = code;
                return { json: (data) => { responseJson = data; } };
            }
        };

        await certificateController.createCertificate(req, res);
        assert.strictEqual(statusCode, 404);
        assert.strictEqual(responseJson.success, false);
    });

    // Test 5: Successful certificate generation for valid evaluation
    let createdCertId = null;
    await test('POST /api/certificates creates verified certificate for valid evaluation', async () => {
        let statusCode = null;
        let responseJson = null;

        const req = {
            body: {
                recipientName: 'Tejas Sandeep Buddhewar',
                evaluationReference: 'Sample_Research_Paper_Analysis.xlsx',
                documentTitle: 'Implementation of Different Types of Joins'
            },
            query: {},
            headers: {}
        };
        const res = {
            status: (code) => {
                statusCode = code;
                return { json: (data) => { responseJson = data; } };
            }
        };

        await certificateController.createCertificate(req, res);
        assert.strictEqual(statusCode, 201);
        assert.strictEqual(responseJson.success, true);
        assert.ok(responseJson.certificate);
        assert.ok(responseJson.certificate.id);
        assert.strictEqual(responseJson.certificate.recipientName, 'Tejas Sandeep Buddhewar');
        assert.ok(responseJson.certificate.metrics.cognitive.count > 0);
        createdCertId = responseJson.certificate.id;
    });

    // Test 6: PDF buffer generation & headers
    await test('PDF generator creates valid A4 Landscape PDF with %PDF header', async () => {
        const cert = certificateStore.getCertificateById(createdCertId);
        assert.ok(cert, 'Created certificate must exist in store');

        const pdfBuffer = await certificateGenerator.generateCertificatePdfBuffer({
            certificateId: cert.id,
            recipientName: cert.recipientName,
            documentTitle: cert.documentTitle,
            issuedAt: cert.issuedAt,
            metrics: cert.metrics,
            qualityScore: cert.qualityScore
        });

        assert.ok(pdfBuffer instanceof Buffer);
        assert.ok(pdfBuffer.length > 2000, 'PDF buffer must have valid size');
        // Check magic bytes for PDF format (%PDF-)
        const magic = pdfBuffer.slice(0, 5).toString('ascii');
        assert.strictEqual(magic, '%PDF-');
    });

    // Test 7: Download endpoint returns binary PDF stream with proper headers
    await test('GET /api/certificates/:id/download sends PDF binary stream', async () => {
        const headers = {};
        let sentBuffer = null;

        const req = { params: { certificateId: createdCertId } };
        const res = {
            setHeader: (k, v) => { headers[k] = v; },
            send: (buf) => { sentBuffer = buf; },
            status: (code) => ({ json: (d) => { throw new Error(`Unexpected status ${code}: ${JSON.stringify(d)}`); } })
        };

        await certificateController.downloadCertificate(req, res);
        assert.strictEqual(headers['Content-Type'], 'application/pdf');
        assert.ok(headers['Content-Disposition'].includes(`Evalix_Certificate_${createdCertId}.pdf`));
        assert.ok(sentBuffer && sentBuffer.length > 2000);
    });

    // Test 8: Get certificate by ID
    await test('GET /api/certificates/:id returns certificate metadata', async () => {
        let statusCode = null;
        let responseJson = null;

        const req = { params: { certificateId: createdCertId } };
        const res = {
            status: (code) => {
                statusCode = code;
                return { json: (data) => { responseJson = data; } };
            }
        };

        await certificateController.getCertificateById(req, res);
        assert.strictEqual(statusCode, 200);
        assert.strictEqual(responseJson.certificate.id, createdCertId);
    });

    // Test 9: Get certificate history list
    await test('GET /api/certificates lists historical certificates', async () => {
        let statusCode = null;
        let responseJson = null;

        const req = {};
        const res = {
            status: (code) => {
                statusCode = code;
                return { json: (data) => { responseJson = data; } };
            }
        };

        await certificateController.getCertificates(req, res);
        assert.strictEqual(statusCode, 200);
        assert.ok(Array.isArray(responseJson.certificates));
        assert.ok(responseJson.count >= 1);
        assert.ok(responseJson.certificates.some(c => c.id === createdCertId));
    });

    console.log(`\nTest results: ${passed} passed, ${failed} failed.`);
    if (failed > 0) {
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error('Test runner error:', err);
    process.exit(1);
});

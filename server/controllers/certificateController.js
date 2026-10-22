// server/controllers/certificateController.js
const path = require('path');
const fs = require('fs');
const certificateStore = require('../utils/certificateStore');
const certificateGenerator = require('../utils/certificateGenerator');
const reportGenerator = require('../utils/reportGenerator');

// Pre-seeded sample evaluation data for the demo sample analysis
const SAMPLE_EVALUATION_DATA = {
    paperInfo: {
        filename: 'Sample_Research_Paper_Exp7.pdf',
        filesize: 518118,
        textLength: 14280,
        analyzedAt: new Date().toISOString()
    },
    domains: {
        cognitive: {
            count: 104,
            subdomains: {
                remember: 18, understand: 26, apply: 22,
                analyze: 19, evaluate: 11, create: 8
            }
        },
        affective: {
            count: 36,
            subdomains: {
                receiving: 8, responding: 12, valuing: 7,
                organizing: 5, characterizing: 4
            }
        },
        psychomotor: {
            count: 24,
            subdomains: {
                perception: 4, set: 3, guidedResponse: 5,
                mechanism: 6, complexResponse: 3, adaptation: 2, origination: 1
            }
        }
    },
    qualityScore: {
        documentType: 'Project Report',
        overallScore: 85,
        grade: 'Proficient',
        gradeBand: 'B',
        gradeColor: '#10B981',
        structuralScore: 80,
        bloomsAlignmentScore: 90
    }
};

/**
 * Locate and verify an existing evaluation on the server.
 * Returns { paperInfo, domains, qualityScore } or null if not found.
 */
const resolveTrustedEvaluation = async (rawRef) => {
    if (!rawRef || typeof rawRef !== 'string') return null;
    const cleanRef = path.basename(rawRef.trim());

    // 1. Check if it's the built-in demo sample
    if (cleanRef.toLowerCase().includes('sample_research_paper') || cleanRef.toLowerCase().includes('sample_analysis')) {
        return SAMPLE_EVALUATION_DATA;
    }

    const analysesCacheDir = path.join(__dirname, '..', 'cache', 'analyses');
    const possibleCacheNames = [
        `${cleanRef}.json`,
        `${cleanRef}.xlsx.json`,
        cleanRef.endsWith('.xlsx') ? `${cleanRef}.json` : `${cleanRef}.xlsx.json`
    ];

    for (const cName of possibleCacheNames) {
        const cacheFilePath = path.join(analysesCacheDir, cName);
        if (fs.existsSync(cacheFilePath)) {
            try {
                const data = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
                if (data && (data.domains || data.classificationResults?.domains)) {
                    return {
                        paperInfo: data.paperInfo || { filename: cleanRef },
                        domains: data.domains || data.classificationResults?.domains,
                        qualityScore: data.qualityScore || null
                    };
                }
            } catch (err) {
                console.warn(`Error reading cached analysis file ${cName}:`, err.message);
            }
        }
    }

    // 2. If not found in cache, check if corresponding report file exists in reports/
    const reportFilename = cleanRef.endsWith('.xlsx') ? cleanRef : `${cleanRef}.xlsx`;
    const reportPath = reportGenerator.getReportPath(reportFilename);

    if (fs.existsSync(reportPath)) {
        try {
            const Excel = require('exceljs');
            const wb = new Excel.Workbook();
            await wb.xlsx.readFile(reportPath);

            const domains = {
                cognitive: { count: 0, subdomains: {} },
                affective: { count: 0, subdomains: {} },
                psychomotor: { count: 0, subdomains: {} }
            };

            const sheetMap = {
                'Cognitive': 'cognitive',
                'Affective': 'affective',
                'Psychomotor': 'psychomotor'
            };

            for (const [sheetName, domainKey] of Object.entries(sheetMap)) {
                const sheet = wb.getWorksheet(sheetName);
                if (sheet) {
                    sheet.eachRow((row, rowNum) => {
                        if (rowNum > 1) {
                            const count = parseInt(row.getCell(2).value, 10) || 0;
                            const sub = (row.getCell(1).value || '').toString().toLowerCase().trim();
                            if (sub) {
                                domains[domainKey].subdomains[sub] = count;
                                domains[domainKey].count += count;
                            }
                        }
                    });
                }
            }

            return {
                paperInfo: { filename: reportFilename.replace(/_analysis_\d+\.xlsx$/i, '') },
                domains,
                qualityScore: null
            };
        } catch (err) {
            console.warn(`Could not parse Excel report for certificate validation ${reportFilename}:`, err.message);
        }
    }

    return null;
};

/**
 * POST /api/certificates
 * Generates a certificate after validating that the evaluation exists and succeeded.
 */
exports.createCertificate = async (req, res) => {
    try {
        const { recipientName, evaluationReference, documentTitle: clientTitle } = req.body;

        // 1. Validate recipient name
        if (!recipientName || typeof recipientName !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Recipient full name is required.'
            });
        }

        const trimmedName = recipientName.trim();
        if (trimmedName.length < 2 || trimmedName.length > 100) {
            return res.status(400).json({
                success: false,
                error: 'Recipient name must be between 2 and 100 characters.'
            });
        }

        // Allow unicode letters, spaces, hyphens, periods, commas, apostrophes
        const nameRegex = /^[\p{L}\p{M}\s.'\-]+$/u;
        if (!nameRegex.test(trimmedName)) {
            return res.status(400).json({
                success: false,
                error: 'Recipient name contains invalid characters. Please use letters, spaces, and standard punctuation.'
            });
        }

        // 2. Validate evaluation reference
        if (!evaluationReference || typeof evaluationReference !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'A valid evaluation reference is required to issue a certificate.'
            });
        }

        // 3. Verify server-side evaluation data (Never trust client scores/domains!)
        const trustedEval = await resolveTrustedEvaluation(evaluationReference);
        if (!trustedEval) {
            return res.status(404).json({
                success: false,
                error: 'Evaluation reference not found or evaluation has not completed successfully. Certificates can only be issued for completed evaluations.'
            });
        }

        // Compute domain metrics from trusted data
        const domains = trustedEval.domains || {};
        const cogCount = domains.cognitive?.count || 0;
        const affCount = domains.affective?.count || 0;
        const psyCount = domains.psychomotor?.count || 0;
        const totalVerbs = cogCount + affCount + psyCount;

        const metrics = {
            totalVerbs,
            cognitive: {
                count: cogCount,
                percentage: totalVerbs > 0 ? Math.round((cogCount / totalVerbs) * 100) : 0
            },
            affective: {
                count: affCount,
                percentage: totalVerbs > 0 ? Math.round((affCount / totalVerbs) * 100) : 0
            },
            psychomotor: {
                count: psyCount,
                percentage: totalVerbs > 0 ? Math.round((psyCount / totalVerbs) * 100) : 0
            }
        };

        // Determine verified document title
        const verifiedTitle = trustedEval.paperInfo?.filename || 
                             trustedEval.paperInfo?.title || 
                             (clientTitle && typeof clientTitle === 'string' ? clientTitle.trim() : null) || 
                             'Evaluated Document';

        // Quality score if present
        const qualityScore = trustedEval.qualityScore ? {
            overallScore: trustedEval.qualityScore.overallScore,
            grade: trustedEval.qualityScore.grade,
            gradeBand: trustedEval.qualityScore.gradeBand,
            gradeColor: trustedEval.qualityScore.gradeColor,
            documentType: trustedEval.qualityScore.documentType
        } : null;

        // 4. Generate unique certificate record and ID
        const certificateId = certificateStore.generateCertificateId();
        const issuedAt = new Date().toISOString();

        const certificateRecord = {
            id: certificateId,
            recipientName: trimmedName,
            documentTitle: verifiedTitle,
            evaluationReference: path.basename(evaluationReference.trim()),
            issuedAt,
            metrics,
            qualityScore
        };

        // Save certificate to store
        certificateStore.saveCertificate(certificateRecord);

        // 5. Generate PDF buffer
        const pdfBuffer = await certificateGenerator.generateCertificatePdfBuffer({
            certificateId,
            recipientName: trimmedName,
            documentTitle: verifiedTitle,
            issuedAt,
            metrics,
            qualityScore
        });

        // If client requested direct PDF download
        if (req.query?.download === 'true' || req.headers?.accept?.includes('application/pdf')) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="Evalix_Certificate_${certificateId}.pdf"`);
            res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
            return res.send(pdfBuffer);
        }

        // Otherwise return JSON with certificate data & download link
        return res.status(201).json({
            success: true,
            certificate: certificateRecord,
            downloadUrl: `/api/certificates/${certificateId}/download`
        });

    } catch (error) {
        console.error('Error generating certificate:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate certificate'
        });
    }
};

/**
 * GET /api/certificates/:certificateId/download
 * Downloads the certificate PDF by certificate ID
 */
exports.downloadCertificate = async (req, res) => {
    try {
        const { certificateId } = req.params;
        if (!certificateId || !/^EVX-[\w-]+$/i.test(certificateId.trim())) {
            return res.status(400).json({
                success: false,
                error: 'Invalid certificate ID format'
            });
        }

        const cert = certificateStore.getCertificateById(certificateId);
        if (!cert) {
            return res.status(404).json({
                success: false,
                error: 'Certificate not found'
            });
        }

        // Generate PDF on the fly from verified stored record
        const pdfBuffer = await certificateGenerator.generateCertificatePdfBuffer({
            certificateId: cert.id,
            recipientName: cert.recipientName,
            documentTitle: cert.documentTitle,
            issuedAt: cert.issuedAt,
            metrics: cert.metrics,
            qualityScore: cert.qualityScore
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Evalix_Certificate_${cert.id}.pdf"`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
        return res.send(pdfBuffer);

    } catch (error) {
        console.error('Error downloading certificate:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to download certificate'
        });
    }
};

/**
 * GET /api/certificates/:certificateId
 * Retrieves certificate metadata by ID
 */
exports.getCertificateById = async (req, res) => {
    try {
        const { certificateId } = req.params;
        if (!certificateId || !/^EVX-[\w-]+$/i.test(certificateId.trim())) {
            return res.status(400).json({
                success: false,
                error: 'Invalid certificate ID format'
            });
        }

        const cert = certificateStore.getCertificateById(certificateId);
        if (!cert) {
            return res.status(404).json({
                success: false,
                error: 'Certificate not found'
            });
        }

        return res.status(200).json({
            success: true,
            certificate: cert,
            downloadUrl: `/api/certificates/${cert.id}/download`
        });
    } catch (error) {
        console.error('Error getting certificate:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to retrieve certificate'
        });
    }
};

/**
 * GET /api/certificates
 * Lists certificate history (newest first)
 */
exports.getCertificates = async (req, res) => {
    try {
        const certs = certificateStore.getAllCertificates();
        return res.status(200).json({
            success: true,
            count: certs.length,
            certificates: certs
        });
    } catch (error) {
        console.error('Error fetching certificates list:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch certificates'
        });
    }
};

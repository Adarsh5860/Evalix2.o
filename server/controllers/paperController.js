// controllers/paperController.js
const textExtractor = require('../utils/textExtractor');
const verbExtractor = require('../utils/verbExtractor');
const verbClassifier = require('../utils/verbClassifier');
const reportGenerator = require('../utils/reportGenerator');
const path = require('path');
const fs = require('fs');

/**
 * Analyze uploaded research paper
 */
exports.analyzePaper = async (req, res) => {
    try {
        console.log('Starting paper analysis');

        // Check if file is uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log(`Processing file: ${req.file.originalname} (${req.file.mimetype})`);

        // Extract text from file
        console.log('Extracting text from document...');
        const text = await textExtractor.extractText(req.file);

        if (!text || text.length === 0) {
            return res.status(400).json({ error: 'Could not extract text from the document' });
        }

        console.log(`Extracted ${text.length} characters of text`);

        // Extract verbs from text
        console.log('Extracting and identifying verbs...');
        const verbsWithFrequency = await verbExtractor.extractVerbs(text);

        if (verbsWithFrequency.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    message: 'No verbs found in the document',
                    totalTextLength: text.length
                }
            });
        }

        console.log(`Found ${verbsWithFrequency.length} unique verbs with a total of ${verbsWithFrequency.reduce((sum, v) => sum + v.frequency, 0)
            } verb occurrences`);

        // Classify verbs into domains and subdomains
        console.log('Classifying verbs into domains...');
        const classificationResults = await verbClassifier.classifyVerbs(verbsWithFrequency);

        // Add document info
        const paperInfo = {
            filename: req.file.originalname,
            filesize: req.file.size,
            textLength: text.length,
            analyzedAt: new Date().toISOString()
        };

        classificationResults.documentInfo = paperInfo;
        const recommendations = reportGenerator.generateRecommendations(classificationResults);
        classificationResults.recommendations = recommendations;


        // Generate reports
        try {
            console.log('Generating Excel reports...');

            // Update master report
            await reportGenerator.updateMasterReport(paperInfo, classificationResults);

            // Generate individual paper report
            const reportPath = await reportGenerator.generatePaperReport(paperInfo, classificationResults);

            // Get just the filename for the response
            const reportFilename = path.basename(reportPath);

            // Add report info to results
            classificationResults.report = {
                filename: reportFilename,
                path: reportPath,
                url: `/api/papers/reports/${reportFilename}`
            };

            console.log('Reports generated successfully');
        } catch (reportError) {
            console.error('Error generating reports:', reportError);
            // Continue with analysis results even if report generation fails
        }

        // Return analysis results
        console.log('Analysis complete, sending results');
        return res.status(200).json({
            success: true,
            data: classificationResults
        });
    } catch (error) {
        console.error('Error analyzing paper:', error);
        return res.status(500).json({
            error: error.message || 'Error analyzing paper',
            success: false
        });
    }
};

/**
 * Get list of available reports
 */
exports.getReports = async (req, res) => {
    try {
        const reports = await reportGenerator.getAvailableReports();

        return res.status(200).json({
            success: true,
            data: {
                reports: reports
            }
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
        return res.status(500).json({
            error: 'Failed to fetch reports',
            success: false
        });
    }
};

/**
 * Download a specific report
 */
exports.downloadReport = async (req, res) => {
    try {
        const filename = req.params.filename;
        console.log
        // Get the full path (with sanitization built into the function)
        const reportPath = reportGenerator.getReportPath(filename);

        // Check if file exists
        if (!fs.existsSync(reportPath)) {
            return res.status(404).json({
                success: false,
                error: 'Report not found'
            });
        }

        // Send the file
        res.download(reportPath);
    } catch (error) {
        console.error('Error downloading report:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to download report'
        });
    }
};

/**
 * Get the master report (analysis history)
 */
exports.getMasterReport = async (req, res) => {
    try {
        const MASTER_REPORT_PATH = path.join(__dirname, '../reports', 'analysis_history.xlsx');

        // Check if master report exists
        if (!fs.existsSync(MASTER_REPORT_PATH)) {
            return res.status(404).json({
                success: false,
                error: 'Master report not found'
            });
        }

        // Send the file
        res.download(MASTER_REPORT_PATH, 'verb_taxonomy_analysis_history.xlsx');
    } catch (error) {
        console.error('Error getting master report:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get master report'
        });
    }
};
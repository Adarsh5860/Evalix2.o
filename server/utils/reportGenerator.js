// utils/reportGenerator.js
const Excel = require('exceljs');
const path = require('path');
const fs = require('fs');

// Ensure reports directory exists
const REPORTS_DIR = path.join(__dirname, '../reports');
if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

const MASTER_REPORT_PATH = path.join(REPORTS_DIR, 'analysis_history.xlsx');

/**
 * Get list of all available reports
 */
async function getAvailableReports() {
    try {
        // Create reports directory if it doesn't exist
        if (!fs.existsSync(REPORTS_DIR)) {
            fs.mkdirSync(REPORTS_DIR, { recursive: true });
            return [];
        }

        // Get all Excel files in the reports directory
        const files = fs.readdirSync(REPORTS_DIR)
            .filter(file => file.endsWith('.xlsx'))
            .map(file => {
                const stats = fs.statSync(path.join(REPORTS_DIR, file));
                return {
                    filename: file,
                    size: stats.size,
                    created: stats.birthtime,
                    url: `/api/papers/reports/${file}`
                };
            })
            .sort((a, b) => b.created - a.created); // Sort newest first

        return files;
    } catch (error) {
        console.error('Error getting available reports:', error);
        return [];
    }
}

/**
 * Get report file by filename
 */
function getReportPath(filename) {
    // Sanitize filename to prevent path traversal
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9_\-\.]/g, '');
    return path.join(REPORTS_DIR, sanitizedFilename);
}

/**
 * Update master report with new paper analysis
 */
async function updateMasterReport(paperInfo, analysisResults) {
    try {
        let workbook;

        // Check if master file exists, create if not
        if (fs.existsSync(MASTER_REPORT_PATH)) {
            workbook = new Excel.Workbook();
            await workbook.xlsx.readFile(MASTER_REPORT_PATH);
        } else {
            workbook = createNewMasterWorkbook();
        }

        const worksheet = workbook.getWorksheet('Analysis History');

        // Add new row for this paper
        const domainCounts = analysisResults.domains;

        const row = worksheet.addRow([
            worksheet.rowCount,                   // ID (auto-increment)
            paperInfo.filename,                   // Filename
            paperInfo.analyzedAt,                 // Analysis Date
            analysisResults.totalVerbCount,       // Total verbs
            analysisResults.uniqueVerbCount,      // Unique verbs

            // Domain counts
            domainCounts.cognitive.count,         // Cognitive count
            domainCounts.affective.count,         // Affective count 
            domainCounts.psychomotor.count,       // Psychomotor count
            domainCounts.unclassified.count,      // Unclassified count

            // Cognitive subdomains
            domainCounts.cognitive.subdomains.remember || 0,
            domainCounts.cognitive.subdomains.understand || 0,
            domainCounts.cognitive.subdomains.apply || 0,
            domainCounts.cognitive.subdomains.analyze || 0,
            domainCounts.cognitive.subdomains.evaluate || 0,
            domainCounts.cognitive.subdomains.create || 0,

            // Affective subdomains
            domainCounts.affective.subdomains.receiving || 0,
            domainCounts.affective.subdomains.responding || 0,
            domainCounts.affective.subdomains.valuing || 0,
            domainCounts.affective.subdomains.organizing || 0,
            domainCounts.affective.subdomains.characterizing || 0,

            // Psychomotor subdomains
            domainCounts.psychomotor.subdomains.perception || 0,
            domainCounts.psychomotor.subdomains.set || 0,
            domainCounts.psychomotor.subdomains.guidedResponse || 0,
            domainCounts.psychomotor.subdomains.mechanism || 0,
            domainCounts.psychomotor.subdomains.complexResponse || 0,
            domainCounts.psychomotor.subdomains.adaptation || 0,
            domainCounts.psychomotor.subdomains.origination || 0
        ]);

        // Add formatting
        row.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Save the workbook
        await workbook.xlsx.writeFile(MASTER_REPORT_PATH);
        console.log('Master report updated successfully');

        return MASTER_REPORT_PATH;
    } catch (error) {
        console.error('Error updating master report:', error);
        throw error;
    }
}

/**
 * Create a new master workbook with appropriate headers
 */
function createNewMasterWorkbook() {
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Analysis History');

    // Define columns
    worksheet.columns = [
        { header: 'ID', key: 'id', width: 5 },
        { header: 'Filename', key: 'filename', width: 30 },
        { header: 'Analysis Date', key: 'date', width: 20 },
        { header: 'Total Verbs', key: 'totalVerbs', width: 12 },
        { header: 'Unique Verbs', key: 'uniqueVerbs', width: 12 },

        // Domain counts
        { header: 'Cognitive', key: 'cognitive', width: 10 },
        { header: 'Affective', key: 'affective', width: 10 },
        { header: 'Psychomotor', key: 'psychomotor', width: 10 },
        { header: 'Unclassified', key: 'unclassified', width: 10 },

        // Cognitive subdomains
        { header: 'Remember', key: 'remember', width: 10 },
        { header: 'Understand', key: 'understand', width: 10 },
        { header: 'Apply', key: 'apply', width: 10 },
        { header: 'Analyze', key: 'analyze', width: 10 },
        { header: 'Evaluate', key: 'evaluate', width: 10 },
        { header: 'Create', key: 'create', width: 10 },

        // Affective subdomains
        { header: 'Receiving', key: 'receiving', width: 10 },
        { header: 'Responding', key: 'responding', width: 10 },
        { header: 'Valuing', key: 'valuing', width: 10 },
        { header: 'Organizing', key: 'organizing', width: 10 },
        { header: 'Characterizing', key: 'characterizing', width: 10 },

        // Psychomotor subdomains
        { header: 'Perception', key: 'perception', width: 10 },
        { header: 'Set', key: 'set', width: 10 },
        { header: 'Guided Response', key: 'guidedResponse', width: 10 },
        { header: 'Mechanism', key: 'mechanism', width: 10 },
        { header: 'Complex Response', key: 'complexResponse', width: 10 },
        { header: 'Adaptation', key: 'adaptation', width: 10 },
        { header: 'Origination', key: 'origination', width: 10 }
    ];

    // Style header row
    worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }
        };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });

    return workbook;
}

/**
 * Generate detailed Excel report for a single paper
 */
async function generatePaperReport(paperInfo, analysisResults) {
    try {
        const sanitizedFilename = paperInfo.filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const reportPath = path.join(REPORTS_DIR, `${sanitizedFilename}_analysis_${Date.now()}.xlsx`);

        const workbook = new Excel.Workbook();

        // Create Summary worksheet
        const summarySheet = workbook.addWorksheet('Summary');
        createSummarySheet(summarySheet, paperInfo, analysisResults);

        // Create domain-specific worksheets
        createDomainSheet(workbook, 'Cognitive', analysisResults, 'cognitive');
        createDomainSheet(workbook, 'Affective', analysisResults, 'affective');
        createDomainSheet(workbook, 'Psychomotor', analysisResults, 'psychomotor');

        // Create complete verbs list sheet
        createVerbListSheet(workbook, analysisResults);

        // Create recommendations sheet
        createRecommendationsSheet(workbook, analysisResults);

        // Save the workbook
        await workbook.xlsx.writeFile(reportPath);
        console.log(`Paper report created at: ${reportPath}`);

        return reportPath;
    } catch (error) {
        console.error('Error generating paper report:', error);
        throw error;
    }
}

/**
 * Create summary sheet with overall statistics
 */
function createSummarySheet(worksheet, paperInfo, analysisResults) {
    // Add title
    worksheet.mergeCells('A1:F1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Verb Taxonomy Analysis Report';
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center' };

    // Add document info
    worksheet.mergeCells('A3:B3');
    worksheet.getCell('A3').value = 'Document Information';
    worksheet.getCell('A3').font = { bold: true };

    worksheet.getCell('A4').value = 'Filename:';
    worksheet.getCell('B4').value = paperInfo.filename;

    worksheet.getCell('A5').value = 'Analyzed On:';
    worksheet.getCell('B5').value = paperInfo.analyzedAt;

    worksheet.getCell('A6').value = 'Document Size:';
    worksheet.getCell('B6').value = `${Math.round(paperInfo.filesize / 1024)} KB`;

    worksheet.getCell('A7').value = 'Text Length:';
    worksheet.getCell('B7').value = `${paperInfo.textLength} characters`;

    // Add verb statistics
    worksheet.mergeCells('A9:B9');
    worksheet.getCell('A9').value = 'Verb Statistics';
    worksheet.getCell('A9').font = { bold: true };

    worksheet.getCell('A10').value = 'Total Verb Occurrences:';
    worksheet.getCell('B10').value = analysisResults.totalVerbCount;

    worksheet.getCell('A11').value = 'Unique Verbs:';
    worksheet.getCell('B11').value = analysisResults.uniqueVerbCount;

    // Domain distribution table
    worksheet.mergeCells('D3:F3');
    worksheet.getCell('D3').value = 'Domain Distribution';
    worksheet.getCell('D3').font = { bold: true };
    worksheet.getCell('D3').alignment = { horizontal: 'center' };

    // Headers
    worksheet.getCell('D4').value = 'Domain';
    worksheet.getCell('E4').value = 'Count';
    worksheet.getCell('F4').value = 'Percentage';
    ['D4', 'E4', 'F4'].forEach(cell => {
        worksheet.getCell(cell).font = { bold: true };
        worksheet.getCell(cell).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }
        };
    });

    // Domain counts
    const domains = ['cognitive', 'affective', 'psychomotor', 'unclassified'];
    const totalVerbs = analysisResults.totalVerbCount;

    domains.forEach((domain, index) => {
        const row = 5 + index;
        const count = analysisResults.domains[domain].count;
        const percentage = totalVerbs > 0 ? (count / totalVerbs * 100).toFixed(1) : '0.0';

        worksheet.getCell(`D${row}`).value = domain.charAt(0).toUpperCase() + domain.slice(1);
        worksheet.getCell(`E${row}`).value = count;
        worksheet.getCell(`F${row}`).value = `${percentage}%`;
    });

    // Format all used cells
    for (let row = 1; row <= 15; row++) {
        for (let col = 1; col <= 6; col++) {
            const cell = worksheet.getCell(row, col);
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        }
    }
}

/**
 * Create domain-specific worksheet with verbs sorted by subdomain
 */
function createDomainSheet(workbook, sheetName, analysisResults, domainKey) {
    const worksheet = workbook.addWorksheet(sheetName);

    // Add title
    worksheet.mergeCells('A1:D1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `${sheetName} Domain Analysis`;
    titleCell.font = { size: 14, bold: true };
    titleCell.alignment = { horizontal: 'center' };

    // Add subdomain statistics
    worksheet.mergeCells('A3:D3');
    worksheet.getCell('A3').value = 'Subdomain Distribution';
    worksheet.getCell('A3').font = { bold: true };

    // Headers for subdomain stats
    worksheet.getCell('A4').value = 'Subdomain';
    worksheet.getCell('B4').value = 'Count';
    worksheet.getCell('C4').value = 'Domain %';
    worksheet.getCell('D4').value = 'Total %';
    ['A4', 'B4', 'C4', 'D4'].forEach(cell => {
        worksheet.getCell(cell).font = { bold: true };
        worksheet.getCell(cell).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }
        };
    });

    // Subdomain stats
    const domainCount = analysisResults.domains[domainKey].count;
    const totalCount = analysisResults.totalVerbCount;
    const subdomains = Object.keys(analysisResults.domains[domainKey].subdomains);

    subdomains.forEach((subdomain, index) => {
        const row = 5 + index;
        const count = analysisResults.domains[domainKey].subdomains[subdomain];
        const domainPercentage = domainCount > 0 ? (count / domainCount * 100).toFixed(1) : '0.0';
        const totalPercentage = totalCount > 0 ? (count / totalCount * 100).toFixed(1) : '0.0';

        worksheet.getCell(`A${row}`).value = subdomain.charAt(0).toUpperCase() + subdomain.slice(1);
        worksheet.getCell(`B${row}`).value = count;
        worksheet.getCell(`C${row}`).value = `${domainPercentage}%`;
        worksheet.getCell(`D${row}`).value = `${totalPercentage}%`;
    });

    // List of verbs by subdomain
    let currentRow = 5 + subdomains.length + 2;

    // Headers for verb list
    worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'Verbs by Subdomain';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;

    // Create a map of verbs by subdomain
    const verbsBySubdomain = {};
    subdomains.forEach(subdomain => {
        verbsBySubdomain[subdomain] = [];
    });

    analysisResults.verbs.forEach(verb => {
        if (verb.classification.domain === domainKey) {
            const subdomain = verb.classification.subdomain;
            if (verbsBySubdomain[subdomain]) {
                verbsBySubdomain[subdomain].push({
                    verb: verb.verb,
                    frequency: verb.frequency || 1,
                    confidence: verb.classification.confidence
                });
            }
        }
    });

    // Display verbs by subdomain
    subdomains.forEach(subdomain => {
        if (verbsBySubdomain[subdomain].length === 0) return;

        // Subdomain header
        worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
        worksheet.getCell(`A${currentRow}`).value = subdomain.charAt(0).toUpperCase() + subdomain.slice(1);
        worksheet.getCell(`A${currentRow}`).font = { bold: true };
        worksheet.getCell(`A${currentRow}`).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF0F0F0' }
        };
        currentRow++;

        // Verb list headers
        worksheet.getCell(`A${currentRow}`).value = 'Verb';
        worksheet.getCell(`B${currentRow}`).value = 'Frequency';
        worksheet.getCell(`C${currentRow}`).value = 'Confidence';
        ['A', 'B', 'C'].forEach(col => {
            worksheet.getCell(`${col}${currentRow}`).font = { bold: true };
        });
        currentRow++;

        // Sort verbs by frequency
        const sortedVerbs = verbsBySubdomain[subdomain].sort((a, b) => b.frequency - a.frequency);

        // List the verbs
        sortedVerbs.forEach(verb => {
            worksheet.getCell(`A${currentRow}`).value = verb.verb;
            worksheet.getCell(`B${currentRow}`).value = verb.frequency;
            worksheet.getCell(`C${currentRow}`).value = `${Math.round(verb.confidence * 100)}%`;
            currentRow++;
        });

        // Add spacing between subdomains
        currentRow++;
    });
}

/**
 * Create a sheet with all verbs sorted by frequency
 */
function createVerbListSheet(workbook, analysisResults) {
    const worksheet = workbook.addWorksheet('All Verbs');

    // Add title
    worksheet.mergeCells('A1:E1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Complete Verb List';
    titleCell.font = { size: 14, bold: true };
    titleCell.alignment = { horizontal: 'center' };

    // Headers
    worksheet.getCell('A3').value = 'Verb';
    worksheet.getCell('B3').value = 'Frequency';
    worksheet.getCell('C3').value = 'Domain';
    worksheet.getCell('D3').value = 'Subdomain';
    worksheet.getCell('E3').value = 'Confidence';

    ['A3', 'B3', 'C3', 'D3', 'E3'].forEach(cell => {
        worksheet.getCell(cell).font = { bold: true };
        worksheet.getCell(cell).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }
        };
    });

    // Sort verbs by frequency
    const sortedVerbs = [...analysisResults.verbs].sort((a, b) =>
        (b.frequency || 1) - (a.frequency || 1)
    );

    // List all verbs
    sortedVerbs.forEach((verb, index) => {
        const row = 4 + index;

        worksheet.getCell(`A${row}`).value = verb.verb;
        worksheet.getCell(`B${row}`).value = verb.frequency || 1;
        worksheet.getCell(`C${row}`).value = verb.classification.domain.charAt(0).toUpperCase() +
            verb.classification.domain.slice(1);
        worksheet.getCell(`D${row}`).value = verb.classification.subdomain.charAt(0).toUpperCase() +
            verb.classification.subdomain.slice(1);
        worksheet.getCell(`E${row}`).value = `${Math.round(verb.classification.confidence * 100)}%`;
    });

    // Format as table
    worksheet.columns.forEach((column) => {
        column.width = Math.max(12, column.header?.length || 10);
    });
}

/**
 * Create recommendations sheet with insights and suggestions
 */
function createRecommendationsSheet(workbook, analysisResults) {
    const worksheet = workbook.addWorksheet('Recommendations');

    // Add title
    worksheet.mergeCells('A1:D1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Analysis Recommendations';
    titleCell.font = { size: 14, bold: true };
    titleCell.alignment = { horizontal: 'center' };

    // Generate recommendations based on the analysis
    const recommendations = generateRecommendations(analysisResults);

    // Main recommendation
    worksheet.mergeCells('A3:D3');
    worksheet.getCell('A3').value = 'Educational Focus Assessment';
    worksheet.getCell('A3').font = { bold: true };

    worksheet.mergeCells('A4:D6');
    worksheet.getCell('A4').value = recommendations.main;
    worksheet.getCell('A4').alignment = { wrapText: true };

    // Domain-specific recommendations
    let currentRow = 8;

    // Cognitive domain recommendations
    worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'Cognitive Domain Recommendations';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;

    worksheet.mergeCells(`A${currentRow}:D${currentRow + 2}`);
    worksheet.getCell(`A${currentRow}`).value = recommendations.cognitive;
    worksheet.getCell(`A${currentRow}`).alignment = { wrapText: true };
    currentRow += 4;

    // Affective domain recommendations
    worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'Affective Domain Recommendations';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;

    worksheet.mergeCells(`A${currentRow}:D${currentRow + 2}`);
    worksheet.getCell(`A${currentRow}`).value = recommendations.affective;
    worksheet.getCell(`A${currentRow}`).alignment = { wrapText: true };
    currentRow += 4;

    // Psychomotor domain recommendations
    worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'Psychomotor Domain Recommendations';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;

    worksheet.mergeCells(`A${currentRow}:D${currentRow + 2}`);
    worksheet.getCell(`A${currentRow}`).value = recommendations.psychomotor;
    worksheet.getCell(`A${currentRow}`).alignment = { wrapText: true };

    // Format all cells
    for (let row = 1; row <= currentRow + 3; row++) {
        for (let col = 1; col <= 4; col++) {
            const cell = worksheet.getCell(row, col);
            if (!cell.border) {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            }
        }
    }
}

/**
 * Generate recommendations based on analysis results
 */
function generateRecommendations(analysisResults) {
    // Extract domain counts
    const domains = analysisResults.domains;
    const totalVerbs = analysisResults.totalVerbCount;

    // Calculate percentages
    const cognitivePct = totalVerbs > 0 ? (domains.cognitive.count / totalVerbs * 100) : 0;
    const affectivePct = totalVerbs > 0 ? (domains.affective.count / totalVerbs * 100) : 0;
    const psychomotorPct = totalVerbs > 0 ? (domains.psychomotor.count / totalVerbs * 100) : 0;

    // Cognitive subdomain percentages within cognitive domain
    const cogSubdomains = domains.cognitive.subdomains;
    const cogTotal = domains.cognitive.count || 1;

    const lowerOrderCog = (cogSubdomains.remember || 0) + (cogSubdomains.understand || 0);
    const middleOrderCog = (cogSubdomains.apply || 0) + (cogSubdomains.analyze || 0);
    const higherOrderCog = (cogSubdomains.evaluate || 0) + (cogSubdomains.create || 0);

    const lowerOrderPct = (lowerOrderCog / cogTotal * 100) || 0;
    const middleOrderPct = (middleOrderCog / cogTotal * 100) || 0;
    const higherOrderPct = (higherOrderCog / cogTotal * 100) || 0;

    // Main recommendation based on domain balance
    let mainRecommendation = '';
    if (cognitivePct > 70) {
        mainRecommendation = `This document is heavily focused on cognitive processes (${Math.round(cognitivePct)}% of verbs), with limited attention to affective (${Math.round(affectivePct)}%) and psychomotor (${Math.round(psychomotorPct)}%) domains. Consider whether the learning objectives could benefit from a more balanced approach that includes emotional engagement and practical skills.`;
    } else if (cognitivePct < 40 && affectivePct > 40) {
        mainRecommendation = `This document places significant emphasis on affective aspects (${Math.round(affectivePct)}% of verbs), focusing on attitudes, feelings, and values. While this is valuable, you might consider strengthening the cognitive components (currently ${Math.round(cognitivePct)}%) to ensure a balance between emotional engagement and intellectual development.`;
    } else if (cognitivePct < 40 && psychomotorPct > 40) {
        mainRecommendation = `This document strongly emphasizes psychomotor skills and physical actions (${Math.round(psychomotorPct)}% of verbs). While practical skills are important, consider increasing cognitive elements (currently ${Math.round(cognitivePct)}%) to provide theoretical foundations for these practical activities.`;
    } else if (domains.unclassified.count > totalVerbs * 0.3) {
        mainRecommendation = `A significant portion of verbs (${Math.round(domains.unclassified.count / totalVerbs * 100)}%) could not be classified into educational taxonomy domains. This may indicate the use of non-standard verbs or specialized terminology. Consider revising to use more established educational action verbs if this document is intended for educational contexts.`;
    } else {
        mainRecommendation = `This document shows a relatively balanced distribution across cognitive (${Math.round(cognitivePct)}%), affective (${Math.round(affectivePct)}%), and psychomotor (${Math.round(psychomotorPct)}%) domains. This balanced approach addresses multiple aspects of learning.`;
    }

    // Cognitive domain recommendations
    let cognitiveRecommendation = '';
    if (lowerOrderPct > 70) {
        cognitiveRecommendation = `The cognitive content is heavily weighted toward lower-order thinking skills like remembering and understanding (${Math.round(lowerOrderPct)}% of cognitive verbs). Consider incorporating more analysis, evaluation, and creative activities to develop higher-order thinking skills.`;
    } else if (higherOrderPct > 70) {
        cognitiveRecommendation = `The document emphasizes higher-order thinking skills like evaluation and creation (${Math.round(higherOrderPct)}% of cognitive verbs). While this is excellent for advanced learning, consider whether sufficient foundational knowledge and comprehension are being established.`;
    } else if (middleOrderPct > 60) {
        cognitiveRecommendation = `The cognitive focus is primarily on application and analysis (${Math.round(middleOrderPct)}% of cognitive verbs). This practical approach is valuable, but consider balancing with both foundational knowledge and higher-level evaluation/creation activities.`;
    } else if (cogSubdomains.remember > cogTotal * 0.4) {
        cognitiveRecommendation = `There is a strong emphasis on memorization and recall (${Math.round(cogSubdomains.remember / cogTotal * 100)}% of cognitive verbs). Consider incorporating more varied cognitive activities that build on this foundational knowledge.`;
    } else {
        cognitiveRecommendation = `The cognitive dimension shows a good balance across different levels of thinking, from foundational knowledge (${Math.round(lowerOrderPct)}%) to application (${Math.round(middleOrderPct)}%) and higher-order thinking (${Math.round(higherOrderPct)}%). This balanced approach helps develop comprehensive cognitive skills.`;
    }

    // Affective domain recommendations
    let affectiveRecommendation = '';
    if (affectivePct < 10) {
        affectiveRecommendation = `The affective domain is underrepresented in this document (only ${Math.round(affectivePct)}% of total verbs). Consider incorporating elements that address emotional engagement, values development, and motivational aspects to create a more holistic learning experience.`;
    } else if (domains.affective.subdomains.receiving > domains.affective.count * 0.5) {
        affectiveRecommendation = `The affective content focuses primarily on basic awareness and reception (${Math.round(domains.affective.subdomains.receiving / domains.affective.count * 100)}% of affective verbs). Consider developing more advanced affective outcomes like valuing, organizing value systems, and internalizing values.`;
    } else if (domains.affective.subdomains.characterizing > domains.affective.count * 0.5) {
        affectiveRecommendation = `The document emphasizes deep internalization of values (${Math.round(domains.affective.subdomains.characterizing / domains.affective.count * 100)}% of affective verbs), which is excellent. However, ensure that the path to this internalization is adequately supported with preliminary stages of receiving, responding, and valuing.`;
    } else {
        affectiveRecommendation = `The affective dimension shows appropriate attention to emotional and values-based aspects of learning. The distribution across receiving, responding, valuing, organizing, and characterizing provides a comprehensive approach to affective development.`;
    }

    // Psychomotor domain recommendations 
    let psychomotorRecommendation = '';
    if (psychomotorPct < 10) {
        psychomotorRecommendation = `The psychomotor domain is minimally addressed (only ${Math.round(psychomotorPct)}% of total verbs). If practical skills are relevant to your subject matter, consider incorporating more action-oriented learning activities and objectives.`;
    } else if (domains.psychomotor.subdomains.perception > domains.psychomotor.count * 0.5) {
        psychomotorRecommendation = `The psychomotor content focuses heavily on basic perception and awareness (${Math.round(domains.psychomotor.subdomains.perception / domains.psychomotor.count * 100)}% of psychomotor verbs). Consider developing more advanced physical skills through guided practice, mechanism development, and complex response patterns.`;
    } else if ((domains.psychomotor.subdomains.adaptation || 0) + (domains.psychomotor.subdomains.origination || 0) > domains.psychomotor.count * 0.6) {
        psychomotorRecommendation = `The document emphasizes advanced psychomotor skills like adaptation and origination. Ensure that foundational physical skills are adequately developed before expecting such advanced performance.`;
    } else {
        psychomotorRecommendation = `The psychomotor dimension shows an appropriate balance of physical skill development stages. The progression from perception through mechanism to more advanced skills provides a comprehensive approach to developing practical abilities.`;
    }

    return {
        main: mainRecommendation,
        cognitive: cognitiveRecommendation,
        affective: affectiveRecommendation,
        psychomotor: psychomotorRecommendation
    };
}

module.exports = {
    updateMasterReport,
    generatePaperReport,
    getAvailableReports,
    getReportPath,
    generateRecommendations
};
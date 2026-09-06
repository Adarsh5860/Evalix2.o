//textExtractor.js
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extract text from various file formats
 */
exports.extractText = async (file) => {
    try {
        const filePath = file.path;
        const mimeType = file.mimetype;
        const ext = path.extname(file.originalname || file.path).toLowerCase();

        // Extract text based on file type
        if (mimeType === 'application/pdf' || ext === '.pdf') {
            // PDF file processing
            const dataBuffer = fs.readFileSync(filePath);
            const pdfData = await pdfParse(dataBuffer);
            return pdfData.text;
        }
        else if (
            mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            mimeType === 'application/msword' ||
            ext === '.docx' ||
            ext === '.doc'
        ) {
            // Word document processing
            const result = await mammoth.extractRawText({
                path: filePath
            });
            return result.value;
        }
        else if (mimeType === 'text/plain' || ext === '.txt') {
            // Plain text file processing
            return fs.readFileSync(filePath, 'utf8');
        }
        else {
            throw new Error('Unsupported file format');
        }
    } catch (error) {
        console.error('Error extracting text:', error);
        throw error;
    }
};
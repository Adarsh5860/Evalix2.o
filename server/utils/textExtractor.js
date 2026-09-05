//textExtractor.js
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extract text from various file formats
 */
exports.extractText = async (file) => {
    try {
        const filePath = file.path;
        const mimeType = file.mimetype;

        // Extract text based on file type
        if (mimeType === 'application/pdf') {
            // PDF file processing
            const dataBuffer = fs.readFileSync(filePath);
            const pdfData = await pdfParse(dataBuffer);
            return pdfData.text;
        }
        else if (
            mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            mimeType === 'application/msword'
        ) {
            // Word document processing
            const result = await mammoth.extractRawText({
                path: filePath
            });
            return result.value;
        }
        else if (mimeType === 'text/plain') {
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
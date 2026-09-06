//fileUpload.js
const multer = require('multer');
const path = require('path');

// Set up storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const validExtensions = ['.pdf', '.docx', '.doc', '.txt'];
    const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
        'application/msword', // doc
        'text/plain',
        'application/octet-stream'
    ];

    if (validExtensions.includes(ext) || validTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 5MB limit
    }
});

module.exports = upload;
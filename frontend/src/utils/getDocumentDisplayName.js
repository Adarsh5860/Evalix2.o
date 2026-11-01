const getDocumentDisplayName = (filename) => {
    if (!filename) return 'Uploaded Document';

    return filename
        .replace(/Sample_Research_Paper/gi, 'Sample_Report')
        .replace(/_Exp7(?=\.|$)/gi, '');
};

export default getDocumentDisplayName;

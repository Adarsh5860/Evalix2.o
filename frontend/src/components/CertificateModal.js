// frontend/src/components/CertificateModal.js
import React, { useState, useEffect } from 'react';
import { 
    FiAward, 
    FiDownload, 
    FiCheckCircle, 
    FiAlertCircle, 
    FiX, 
    FiClock, 
    FiFileText, 
    FiUser, 
    FiShield, 
    FiLayers,
    FiRefreshCw
} from 'react-icons/fi';
import { 
    generateCertificateApi, 
    downloadCertificatePdfApi, 
    fetchCertificatesHistoryApi 
} from '../services/api';
import '../styles/CertificateModal.scss';

const CertificateModal = ({ isOpen, onClose, data }) => {
    const [recipientName, setRecipientName] = useState('');
    const [documentTitle, setDocumentTitle] = useState('');
    const [activeTab, setActiveTab] = useState('create'); // 'create' | 'history'
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDownloadingHistoryId, setIsDownloadingHistoryId] = useState(null);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [generatedCert, setGeneratedCert] = useState(null);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Initial populate from evaluation data
    useEffect(() => {
        if (data && isOpen) {
            const rawFilename = data.documentInfo?.filename || 'Evaluated Document';
            // Clean up extension for friendly display title if present
            const cleanTitle = rawFilename.replace(/\.[^/.]+$/, '');
            setDocumentTitle(cleanTitle || rawFilename);
            setError(null);
            setSuccessMessage(null);
            setGeneratedCert(null);

            // Pre-fill user name if logged in
            try {
                const storedUser = localStorage.getItem('evalix_user');
                if (storedUser) {
                    const u = JSON.parse(storedUser);
                    if (u.name) setRecipientName(u.name);
                }
            } catch (e) {
                // Ignore
            }
        }
    }, [data, isOpen]);

    // Fetch history when history tab is opened
    useEffect(() => {
        if (activeTab === 'history' && isOpen) {
            loadHistory();
        }
    }, [activeTab, isOpen]);

    const loadHistory = async () => {
        try {
            setLoadingHistory(true);
            const res = await fetchCertificatesHistoryApi();
            if (res && res.certificates) {
                setHistory(res.certificates);
            }
        } catch (err) {
            console.error('Failed to load certificates history:', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    if (!isOpen || !data) return null;

    const evaluationDate = data.documentInfo?.analyzedAt 
        ? new Date(data.documentInfo.analyzedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Determine evaluation reference (report filename)
    const evaluationReference = data.report?.filename || 
                                data.documentInfo?.filename || 
                                'Sample_Research_Paper_Analysis.xlsx';

    // Domain metrics
    const cognitiveCount = data.domains?.cognitive?.count || 0;
    const affectiveCount = data.domains?.affective?.count || 0;
    const psychomotorCount = data.domains?.psychomotor?.count || 0;
    const totalVerbs = data.totalVerbCount || (cognitiveCount + affectiveCount + psychomotorCount);

    const cognitivePct = totalVerbs > 0 ? Math.round((cognitiveCount / totalVerbs) * 100) : 0;
    const affectivePct = totalVerbs > 0 ? Math.round((affectiveCount / totalVerbs) * 100) : 0;
    const psychomotorPct = totalVerbs > 0 ? Math.round((psychomotorCount / totalVerbs) * 100) : 0;

    const qualityScore = data.qualityScore || null;

    // Validate name input
    const validateForm = () => {
        if (!recipientName.trim()) {
            setError('Please enter the recipient full name.');
            return false;
        }
        if (recipientName.trim().length < 2) {
            setError('Recipient name must be at least 2 characters long.');
            return false;
        }
        if (recipientName.trim().length > 100) {
            setError('Recipient name cannot exceed 100 characters.');
            return false;
        }
        return true;
    };

    // Handle Generate & Download PDF
    const handleGenerateAndDownload = async (e) => {
        if (e) e.preventDefault();
        if (isGenerating) return; // Prevent duplicate requests
        if (!validateForm()) return;

        setIsGenerating(true);
        setError(null);
        setSuccessMessage(null);

        try {
            // Call backend API
            const result = await generateCertificateApi({
                recipientName: recipientName.trim(),
                evaluationReference: evaluationReference,
                documentTitle: documentTitle.trim() || data.documentInfo?.filename || 'Evaluated Document'
            });

            if (result && result.success && result.certificate) {
                setGeneratedCert(result.certificate);
                setSuccessMessage(`Certificate ${result.certificate.id} generated successfully! Downloading PDF...`);

                // Automatically trigger PDF download
                await downloadCertificatePdfApi(result.certificate.id);
            } else {
                throw new Error(result?.error || 'Failed to generate certificate');
            }
        } catch (err) {
            console.error('Certificate generation error:', err);
            let msg = 'Failed to generate certificate. Please try again.';
            if (err.response?.data?.error) {
                msg = err.response.data.error;
            } else if (err.message) {
                msg = err.message;
            }
            setError(msg);
        } finally {
            setIsGenerating(false);
        }
    };

    // Download from history
    const handleDownloadHistoryItem = async (certId) => {
        if (isDownloadingHistoryId) return;
        try {
            setIsDownloadingHistoryId(certId);
            await downloadCertificatePdfApi(certId);
        } catch (err) {
            console.error('Download error:', err);
            alert('Failed to download certificate PDF. Please check server connection.');
        } finally {
            setIsDownloadingHistoryId(null);
        }
    };

    return (
        <div className="evalix-modal-backdrop" onClick={onClose}>
            <div 
                className="evalix-certificate-modal glass-panel" 
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="modal-header-bar">
                    <div className="d-flex align-items-center gap-2">
                        <div className="cert-header-icon-wrap">
                            <FiAward className="cert-header-icon" />
                        </div>
                        <div>
                            <h3 className="modal-title m-0">Evaluation Certificate</h3>
                            <span className="modal-subtitle">Official Evalix 2.0 Verification Document</span>
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                        {/* Tab Switcher */}
                        <div className="cert-tab-toggle">
                            <button
                                className={`cert-tab-btn ${activeTab === 'create' ? 'active' : ''}`}
                                onClick={() => setActiveTab('create')}
                                type="button"
                            >
                                Generate Certificate
                            </button>
                            <button
                                className={`cert-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                                onClick={() => setActiveTab('history')}
                                type="button"
                            >
                                Certificate History
                            </button>
                        </div>

                        <button 
                            className="modal-close-btn" 
                            onClick={onClose} 
                            aria-label="Close dialog"
                            type="button"
                        >
                            <FiX />
                        </button>
                    </div>
                </div>

                {/* Modal Content */}
                <div className="modal-body-scroll">
                    {activeTab === 'create' ? (
                        <div className="cert-generator-grid">
                            {/* Left Column: Form & Settings */}
                            <div className="cert-form-pane">
                                {error && (
                                    <div className="cert-alert-box alert-error mb-3">
                                        <FiAlertCircle className="alert-icon" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                {successMessage && (
                                    <div className="cert-alert-box alert-success mb-3">
                                        <FiCheckCircle className="alert-icon" />
                                        <span>{successMessage}</span>
                                    </div>
                                )}

                                <form onSubmit={handleGenerateAndDownload} className="cert-input-form">
                                    <div className="form-group mb-3">
                                        <label className="form-label" htmlFor="recipient-name-input">
                                            Recipient Full Name <span className="text-danger">*</span>
                                        </label>
                                        <div className="input-with-icon">
                                            <FiUser className="input-icon" />
                                            <input
                                                id="recipient-name-input"
                                                type="text"
                                                className="evalix-input"
                                                placeholder="e.g. Dr. Jane Smith or Alex Johnson"
                                                value={recipientName}
                                                onChange={(e) => {
                                                    setRecipientName(e.target.value);
                                                    if (error) setError(null);
                                                }}
                                                maxLength={100}
                                                autoFocus
                                            />
                                        </div>
                                        <span className="field-hint">
                                            Enter the exact legal or academic name to appear prominently on the certificate.
                                        </span>
                                    </div>

                                    <div className="form-group mb-3">
                                        <label className="form-label" htmlFor="document-title-input">
                                            Evaluated Document Title
                                        </label>
                                        <div className="input-with-icon">
                                            <FiFileText className="input-icon" />
                                            <input
                                                id="document-title-input"
                                                type="text"
                                                className="evalix-input"
                                                value={documentTitle}
                                                onChange={(e) => setDocumentTitle(e.target.value)}
                                                maxLength={120}
                                            />
                                        </div>
                                        <span className="field-hint">
                                            Automatically populated from your evaluated file.
                                        </span>
                                    </div>

                                    <div className="meta-info-card p-3 mb-3">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="meta-label">
                                                <FiClock className="me-1" /> Evaluation Date:
                                            </span>
                                            <span className="meta-val">{evaluationDate}</span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="meta-label">
                                                <FiShield className="me-1" /> Certificate ID:
                                            </span>
                                            <span className="meta-val badge-cert-id">
                                                {generatedCert ? generatedCert.id : 'EVX-2026-AUTOGEN'}
                                            </span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="meta-label">
                                                <FiLayers className="me-1" /> Bloom's Verbs:
                                            </span>
                                            <span className="meta-val">{totalVerbs} action verbs analyzed</span>
                                        </div>
                                        {qualityScore && (
                                            <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top border-secondary">
                                                <span className="meta-label">Quality Score:</span>
                                                <span className="meta-val" style={{ color: qualityScore.gradeColor || '#10B981', fontWeight: 'bold' }}>
                                                    {qualityScore.overallScore}/100 ({qualityScore.grade})
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="cert-action-row mt-4">
                                        <button
                                            type="submit"
                                            className="btn-evalix-primary w-100 download-btn"
                                            disabled={isGenerating || !recipientName.trim()}
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Generating High-Res PDF...
                                                </>
                                            ) : (
                                                <>
                                                    <FiDownload className="me-2" />
                                                    Download Certificate PDF
                                                </>
                                            )}
                                        </button>
                                        <span className="print-notice text-center d-block mt-2">
                                            Standard A4 Landscape • Vector Printable PDF with Selectable Text
                                        </span>
                                    </div>
                                </form>
                            </div>

                            {/* Right Column: Live Visual Certificate Preview */}
                            <div className="cert-preview-pane">
                                <div className="preview-header-label">
                                    <span>Interactive Live Preview</span>
                                    <span className="preview-scale-tag">A4 Landscape</span>
                                </div>

                                <div className="cert-sheet-container">
                                    <div className="cert-preview-sheet">
                                        {/* Top Left Geometric Accents */}
                                        <div className="corner-decor top-left">
                                            <div className="facet facet-1"></div>
                                            <div className="facet facet-2"></div>
                                            <div className="facet facet-3"></div>
                                            <div className="facet facet-4"></div>
                                        </div>

                                        {/* Bottom Right Geometric Accents */}
                                        <div className="corner-decor bottom-right">
                                            <div className="facet facet-1"></div>
                                            <div className="facet facet-2"></div>
                                            <div className="facet facet-3"></div>
                                            <div className="facet facet-4"></div>
                                        </div>

                                        {/* Inner Frame */}
                                        <div className="cert-inner-frame">
                                            {/* Corner Gold Dots */}
                                            <div className="gold-dot top-left-dot"></div>
                                            <div className="gold-dot top-right-dot"></div>
                                            <div className="gold-dot btm-left-dot"></div>
                                            <div className="gold-dot btm-right-dot"></div>

                                            {/* Top Seal */}
                                            <div className="cert-seal-badge">
                                                <div className="seal-outer-ring">
                                                    <div className="seal-inner-ring">
                                                        <span className="seal-title">EVALIX</span>
                                                        <span className="seal-ver">2.0</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Certificate Headings */}
                                            <div className="cert-content-body">
                                                <div className="cert-eyebrow">
                                                    EVALIX 2.0 • BLOOM'S TAXONOMY EDUCATIONAL ANALYTICS
                                                </div>

                                                <h1 className="cert-main-title">
                                                    CERTIFICATE OF EVALUATION
                                                </h1>

                                                <div className="cert-subtitle">
                                                    DOCUMENT ANALYSIS & PEDAGOGICAL DOMAIN VERIFICATION
                                                </div>

                                                <div className="cert-divider-line">
                                                    <span className="line-half"></span>
                                                    <span className="diamond"></span>
                                                    <span className="line-half"></span>
                                                </div>

                                                <p className="cert-acknowledgement">
                                                    This certificate acknowledges that
                                                </p>

                                                {/* Recipient Name Highlight */}
                                                <div className="cert-recipient-name">
                                                    {recipientName.trim() || 'Recipient\'s Name'}
                                                </div>
                                                <div className="cert-name-underline"></div>

                                                <p className="cert-statement">
                                                    has successfully completed a comprehensive document evaluation using Evalix 2.0. The submitted work underwent multi-domain Bloom's Taxonomy analysis, quantifying action verb concentrations across cognitive, affective, and psychomotor dimensions.
                                                </p>

                                                {/* Evaluated Document Badge */}
                                                <div className="cert-doc-pill">
                                                    <span className="pill-prefix">EVALUATED DOCUMENT:</span>
                                                    <span className="pill-title">{documentTitle || 'Evaluated Document'}</span>
                                                </div>

                                                {/* Metrics Chips */}
                                                <div className="cert-metrics-row">
                                                    <div className="metric-chip chip-cognitive">
                                                        <span className="chip-name">Cognitive</span>
                                                        <span className="chip-val">{cognitiveCount} Verbs ({cognitivePct}%)</span>
                                                    </div>
                                                    <div className="metric-chip chip-affective">
                                                        <span className="chip-name">Affective</span>
                                                        <span className="chip-val">{affectiveCount} Verbs ({affectivePct}%)</span>
                                                    </div>
                                                    <div className="metric-chip chip-psychomotor">
                                                        <span className="chip-name">Psychomotor</span>
                                                        <span className="chip-val">{psychomotorCount} Verbs ({psychomotorPct}%)</span>
                                                    </div>
                                                    {qualityScore ? (
                                                        <div className="metric-chip chip-quality">
                                                            <span className="chip-name">Quality Audit</span>
                                                            <span className="chip-val">{qualityScore.overallScore}/100 ({qualityScore.gradeBand})</span>
                                                        </div>
                                                    ) : (
                                                        <div className="metric-chip chip-scope">
                                                            <span className="chip-name">Analysis Scope</span>
                                                            <span className="chip-val">{totalVerbs} Verbs Audited</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Footer Metadata */}
                                                <div className="cert-footer-meta">
                                                    <div className="meta-col text-start">
                                                        <span className="meta-sub">COMPLETED:</span>
                                                        <span className="meta-main">{evaluationDate}</span>
                                                    </div>
                                                    <div className="meta-col text-center">
                                                        <span className="meta-sub">VERIFICATION STATUS:</span>
                                                        <span className="meta-main text-primary">AUTOMATED AUDIT VERIFIED</span>
                                                        <span className="meta-sub tiny">Evalix 2.0 Evaluation Engine</span>
                                                    </div>
                                                    <div className="meta-col text-end">
                                                        <span className="meta-sub">CERTIFICATE ID:</span>
                                                        <span className="meta-main id-text">
                                                            {generatedCert ? generatedCert.id : 'EVX-2026-AUTOGEN'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Legal Disclaimer */}
                                                <div className="cert-legal-disclaimer">
                                                    Generated by Evalix 2.0 (Bloom's Taxonomy Educational Analysis System). This certificate validates algorithmic document evaluation completion and is not an accredited institutional qualification.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Certificate History View */
                        <div className="cert-history-pane">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <h4 className="history-title m-0">Issued Certificates History</h4>
                                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                                        All certificates generated across document evaluation sessions.
                                    </span>
                                </div>
                                <button 
                                    className="btn-evalix-secondary btn-sm"
                                    onClick={loadHistory}
                                    disabled={loadingHistory}
                                >
                                    <FiRefreshCw className={`me-1 ${loadingHistory ? 'spin' : ''}`} />
                                    Refresh
                                </button>
                            </div>

                            {loadingHistory ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary mb-2" role="status"></div>
                                    <p className="text-muted">Loading certificate records...</p>
                                </div>
                            ) : history.length === 0 ? (
                                <div className="empty-history-box text-center py-5">
                                    <FiAward style={{ fontSize: '3rem', color: '#64748B', marginBottom: '1rem' }} />
                                    <h5 style={{ color: '#F8FAFC' }}>No Certificates Generated Yet</h5>
                                    <p className="text-muted" style={{ maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                                        Once you generate a certificate for an evaluated paper, it will appear here for one-click re-download.
                                    </p>
                                    <button 
                                        className="btn-evalix-primary btn-sm"
                                        onClick={() => setActiveTab('create')}
                                    >
                                        Generate Your First Certificate
                                    </button>
                                </div>
                            ) : (
                                <div className="history-table-responsive">
                                    <table className="evalix-history-table">
                                        <thead>
                                            <tr>
                                                <th>Certificate ID</th>
                                                <th>Recipient Name</th>
                                                <th>Document Title</th>
                                                <th>Issue Date</th>
                                                <th>Quality Score</th>
                                                <th className="text-end">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {history.map((item) => (
                                                <tr key={item.id}>
                                                    <td>
                                                        <span className="badge-cert-id">{item.id}</span>
                                                    </td>
                                                    <td className="fw-bold" style={{ color: '#F8FAFC' }}>
                                                        {item.recipientName}
                                                    </td>
                                                    <td style={{ color: '#CBD5E1' }}>
                                                        {item.documentTitle}
                                                    </td>
                                                    <td style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                                                        {new Date(item.issuedAt).toLocaleDateString()}
                                                    </td>
                                                    <td>
                                                        {item.qualityScore ? (
                                                            <span className="badge-quality-score" style={{
                                                                color: item.qualityScore.gradeColor || '#10B981',
                                                                background: `${item.qualityScore.gradeColor || '#10B981'}15`,
                                                                padding: '3px 8px',
                                                                borderRadius: '4px',
                                                                fontSize: '0.8rem',
                                                                fontWeight: '600'
                                                            }}>
                                                                {item.qualityScore.overallScore}/100 ({item.qualityScore.gradeBand})
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>—</span>
                                                        )}
                                                    </td>
                                                    <td className="text-end">
                                                        <button
                                                            className="btn-evalix-secondary btn-sm py-1 px-2"
                                                            onClick={() => handleDownloadHistoryItem(item.id)}
                                                            disabled={isDownloadingHistoryId === item.id}
                                                            title="Download PDF"
                                                        >
                                                            {isDownloadingHistoryId === item.id ? (
                                                                <span className="spinner-border spinner-border-sm" role="status"></span>
                                                            ) : (
                                                                <>
                                                                    <FiDownload className="me-1" />
                                                                    PDF
                                                                </>
                                                            )}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CertificateModal;

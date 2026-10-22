// components/CertificateModal.js
import React, { useState, useEffect, useMemo } from 'react';
import { 
    FiAward, 
    FiPrinter, 
    FiExternalLink, 
    FiX, 
    FiCheck, 
    FiCopy, 
    FiFileText, 
    FiUser, 
    FiHome, 
    FiCalendar, 
    FiLayers 
} from 'react-icons/fi';
import { 
    formatCertificateData, 
    generateCertificateHtml, 
    openCertificatePrintWindow, 
    openCertificateViewWindow 
} from '../utils/certificateGenerator';
import '../styles/Certificate.scss';

const DOCUMENT_TYPES = [
    'Project Report',
    'Mini Project Report',
    'Dissertation',
    'Technical Report',
    'Research Paper'
];

const CertificateModal = ({ isOpen, onClose, data }) => {
    const initialCert = useMemo(() => formatCertificateData(data || {}), [data]);

    const [formState, setFormState] = useState(initialCert);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (data) {
            setFormState(formatCertificateData(data));
        }
    }, [data]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleChange = (field, value) => {
        setFormState(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCopyId = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(formState.certificateId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handlePrint = () => {
        openCertificatePrintWindow(formState);
    };

    const handleOpenTab = () => {
        openCertificateViewWindow(formState);
    };

    // Live rendered preview HTML for the iframe
    const previewHtml = generateCertificateHtml(formState, false);

    return (
        <div className="evalix-cert-modal-backdrop" onClick={onClose}>
            <div className="evalix-cert-modal" onClick={(e) => e.stopPropagation()}>
                
                {/* Header */}
                <div className="cert-modal-header">
                    <div className="header-left">
                        <div className="cert-header-icon">
                            <FiAward />
                        </div>
                        <div>
                            <h3 className="cert-modal-title">
                                Learning Domain Quality Certificate
                                <span className="cert-badge">Grade {formState.gradeBand} • {formState.grade}</span>
                            </h3>
                            <p className="cert-modal-sub">
                                Official verification credential for {formState.documentTitle}
                            </p>
                        </div>
                    </div>
                    <button className="modal-close-btn" onClick={onClose} title="Close (Esc)">
                        <FiX />
                    </button>
                </div>

                {/* Body: Configuration Controls (Left) & Live Preview (Right) */}
                <div className="cert-modal-body">
                    
                    {/* Left: Customization Drawer */}
                    <div className="cert-config-drawer">
                        <div>
                            <div className="drawer-section-title">
                                <FiLayers />
                                <span>Certificate Credentials</span>
                            </div>

                            <div className="form-group-cert">
                                <label><FiFileText className="me-1" /> Document Title</label>
                                <input
                                    type="text"
                                    value={formState.documentTitle}
                                    onChange={(e) => handleChange('documentTitle', e.target.value)}
                                    placeholder="Enter document title"
                                />
                            </div>

                            <div className="form-group-cert">
                                <label><FiLayers className="me-1" /> Document Archetype</label>
                                <select
                                    value={formState.documentType}
                                    onChange={(e) => handleChange('documentType', e.target.value)}
                                >
                                    {DOCUMENT_TYPES.map(dt => (
                                        <option key={dt} value={dt}>{dt}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group-cert">
                                <label><FiUser className="me-1" /> Candidate / Author(s)</label>
                                <input
                                    type="text"
                                    value={formState.candidateName}
                                    onChange={(e) => handleChange('candidateName', e.target.value)}
                                    placeholder="e.g. Student / Team Names"
                                />
                            </div>

                            <div className="form-group-cert">
                                <label><FiHome className="me-1" /> Institution / College</label>
                                <input
                                    type="text"
                                    value={formState.institution}
                                    onChange={(e) => handleChange('institution', e.target.value)}
                                    placeholder="e.g. Walchand College of Engineering, Sangli"
                                />
                            </div>

                            <div className="form-group-cert">
                                <label><FiHome className="me-1" /> Department</label>
                                <input
                                    type="text"
                                    value={formState.department}
                                    onChange={(e) => handleChange('department', e.target.value)}
                                    placeholder="e.g. Department of Information Technology"
                                />
                            </div>

                            <div className="form-group-cert">
                                <label><FiUser className="me-1" /> Faculty Guide / Evaluator</label>
                                <input
                                    type="text"
                                    value={formState.facultyGuide}
                                    onChange={(e) => handleChange('facultyGuide', e.target.value)}
                                    placeholder="e.g. Dr. A. J. Umbarkar"
                                />
                            </div>

                            <div className="form-group-cert">
                                <label><FiCalendar className="me-1" /> Academic Session / Year</label>
                                <input
                                    type="text"
                                    value={formState.academicYear}
                                    onChange={(e) => handleChange('academicYear', e.target.value)}
                                    placeholder="e.g. 2026 – 2027"
                                />
                            </div>

                            {/* Summary Metrics Pill Box */}
                            <div className="cert-score-summary-card">
                                <div className="summary-row">
                                    <span className="summary-label">Final Quality Score:</span>
                                    <span className="summary-val" style={{ color: formState.gradeColor }}>
                                        {formState.overallScore}%
                                    </span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-label">Structural Completeness:</span>
                                    <span className="summary-val">{formState.structuralScore}%</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-label">Bloom's Alignment:</span>
                                    <span className="summary-val">{formState.bloomsAlignmentScore}%</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-label">Action Verbs:</span>
                                    <span className="summary-val">{formState.totalVerbs} Verbs</span>
                                </div>
                                <div className="summary-row" style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                                    <span className="summary-label">Verification ID:</span>
                                    <span className="summary-val" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={handleCopyId} title="Click to copy">
                                        <code>{formState.certificateId}</code>
                                        {copied ? <FiCheck style={{ color: '#10b981' }} /> : <FiCopy style={{ fontSize: '0.75rem' }} />}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="cert-drawer-actions">
                            <button className="btn-print-cert" onClick={handlePrint}>
                                <FiPrinter />
                                <span>Print / Save as PDF</span>
                            </button>

                            <button className="btn-view-tab" onClick={handleOpenTab}>
                                <FiExternalLink />
                                <span>Open Fullscreen in New Tab</span>
                            </button>
                        </div>
                    </div>

                    {/* Right: Scaled Interactive Live Preview */}
                    <div className="cert-preview-viewport">
                        <div className="cert-preview-scaler">
                            <iframe
                                title="Certificate Live Preview"
                                srcDoc={previewHtml}
                                sandbox="allow-same-origin allow-scripts"
                            />
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default CertificateModal;

// components/CertificateView.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiPrinter, FiArrowLeft, FiAward, FiExternalLink } from 'react-icons/fi';
import { getCertificateDataApi } from '../services/api';
import { 
    formatCertificateData, 
    generateCertificateHtml, 
    openCertificatePrintWindow 
} from '../utils/certificateGenerator';
import '../styles/Certificate.scss';

const CertificateView = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [certData, setCertData] = useState(() => {
        if (location.state?.certificate) return location.state.certificate;
        if (location.state?.qualityResult) return formatCertificateData(location.state);
        return null;
    });

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const filename = params.get('filename') || location.state?.filename;

        if (!certData && filename) {
            setLoading(true);
            getCertificateDataApi(filename)
                .then(res => {
                    if (res?.data?.certificate) {
                        setCertData(res.data.certificate);
                    }
                })
                .catch(err => {
                    console.warn('Could not load certificate from API, using fallback:', err);
                    setCertData(formatCertificateData({ filename }));
                })
                .finally(() => setLoading(false));
        } else if (!certData) {
            // Default sample certificate if accessed directly
            setCertData(formatCertificateData({
                documentTitle: 'Sample Research Paper Analysis Exp7',
                overallScore: 88.5,
                grade: 'Exemplary',
                gradeBand: 'A',
                structuralScore: 92,
                bloomsAlignmentScore: 85,
                totalVerbs: 168
            }));
        }
    }, [location, certData]);

    const handlePrint = () => {
        if (certData) {
            openCertificatePrintWindow(certData);
        }
    };

    const previewHtml = certData ? generateCertificateHtml(certData, false) : '';

    return (
        <div className="evalix-dashboard-page certificate-view-page">
            <div className="page-header-block mb-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                    <div className="header-badge">
                        <span className="badge-sparkle">✦</span>
                        <span>Official Evaluation Credential</span>
                    </div>
                    <h1 className="header-title">
                        Learning Domain <span className="gradient-text">Certificate</span>
                    </h1>
                </div>

                <div className="d-flex gap-2">
                    <button className="btn-evalix-secondary" onClick={() => navigate(-1)}>
                        <FiArrowLeft className="me-2" />
                        Back
                    </button>
                    <button className="btn-evalix-primary" onClick={handlePrint}>
                        <FiPrinter className="me-2" />
                        Print Certificate
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="glass-panel text-center py-5">
                    <span className="button-spinner me-2"></span>
                    <span>Generating Official Certificate...</span>
                </div>
            ) : (
                <div className="cert-preview-viewport glass-panel" style={{ minHeight: '800px', borderRadius: '16px' }}>
                    <div className="cert-preview-scaler">
                        <iframe
                            title="Certificate View"
                            srcDoc={previewHtml}
                            sandbox="allow-same-origin allow-scripts"
                            style={{ maxWidth: '100%' }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default CertificateView;

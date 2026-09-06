import React, { useState, useEffect } from 'react';
import { FiDownload, FiFileText, FiDatabase, FiAlertCircle, FiClock, FiHardDrive } from 'react-icons/fi';
import { getReportsList, downloadReportFile } from '../services/api';
import '../styles/ReportsList.scss';

const ReportsList = ({ currentReport }) => {
    const [reports, setReports] = useState([]);
    const [downloading, setDownloading] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        getReportsList()
            .then(res => {
                if (res?.data?.reports) {
                    setReports(res.data.reports);
                }
            })
            .catch(err => console.warn('Could not load reports list:', err));
    }, [currentReport]);

    const formatDate = (isoString) => {
        if (!isoString) return 'Recent';
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDownload = async (url, filename) => {
        try {
            setDownloading(filename);
            setError(null);
            await downloadReportFile(url, filename);
        } catch (err) {
            setError(`Failed to download: ${err.message}`);
        } finally {
            setDownloading(null);
        }
    };

    return (
        <div className="evalix-dashboard-page reports-page">
            <div className="page-header-block mb-4">
                <div className="header-badge">
                    <span className="badge-sparkle">✦</span>
                    <span>Excel Exports & Historical Audits</span>
                </div>
                <h1 className="header-title">
                    Analysis <span className="gradient-text">Reports</span>
                </h1>
                <p className="header-subtitle">
                    Download detailed multi-tab Excel workbooks containing complete verb inventories, domain counts, and longitudinal analysis logs.
                </p>
            </div>

            {error && (
                <div className="evalix-alert-banner alert-error mb-4">
                    <FiAlertCircle className="alert-icon" />
                    <div className="alert-message">{error}</div>
                    <button className="alert-close-btn" onClick={() => setError(null)}>×</button>
                </div>
            )}

            {/* Master History Report Hero Card */}
            <div className="master-report-card glass-panel mb-4">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-3">
                        <div className="report-icon-box green">
                            <FiDatabase />
                        </div>
                        <div>
                            <span className="report-badge master">Master Repository</span>
                            <h3 className="report-title">Longitudinal Analysis History Report</h3>
                            <p className="report-desc">
                                Cumulative spreadsheet consolidating metrics from every analyzed paper in the workspace.
                            </p>
                        </div>
                    </div>

                    <button
                        className="btn-evalix-primary"
                        onClick={() => handleDownload('/api/papers/master-report', 'analysis_history.xlsx')}
                        disabled={downloading === 'analysis_history.xlsx'}
                    >
                        <FiDownload className="me-2" />
                        {downloading === 'analysis_history.xlsx' ? 'Downloading...' : 'Download Master History'}
                    </button>
                </div>
            </div>

            {/* Individual Available Reports */}
            <div className="available-reports-card glass-panel">
                <div className="card-header-bar">
                    <h3 className="section-title">Individual Paper Reports</h3>
                    <span className="reports-count-pill">{reports.length} Reports Found</span>
                </div>

                <div className="reports-list-wrap">
                    {/* Current Report */}
                    {currentReport && (
                        <div className="report-row-item active-current">
                            <div className="d-flex align-items-center gap-3">
                                <div className="report-icon-box purple">
                                    <FiFileText />
                                </div>
                                <div>
                                    <div className="report-name-row">
                                        <span className="report-file-name">{currentReport.filename}</span>
                                        <span className="current-badge">Current Analysis</span>
                                    </div>
                                    <div className="report-meta-text">
                                        <FiClock className="me-1" />
                                        <span>Generated on {formatDate(currentReport.created || new Date().toISOString())}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                className="btn-evalix-secondary"
                                onClick={() => handleDownload(currentReport.url, currentReport.filename)}
                                disabled={downloading === currentReport.filename}
                            >
                                <FiDownload className="me-2" />
                                {downloading === currentReport.filename ? 'Downloading...' : 'Download Excel'}
                            </button>
                        </div>
                    )}

                    {/* Historical Reports */}
                    {reports && reports.length > 0 ? (
                        reports
                            .filter(r => !currentReport || r.filename !== currentReport.filename)
                            .map((rep, idx) => (
                                <div key={idx} className="report-row-item">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="report-icon-box blue">
                                            <FiFileText />
                                        </div>
                                        <div>
                                            <span className="report-file-name">{rep.filename}</span>
                                            <div className="report-meta-text">
                                                <FiClock className="me-1" />
                                                <span>{formatDate(rep.created)}</span>
                                                {rep.size && (
                                                    <>
                                                        <span className="meta-sep">•</span>
                                                        <FiHardDrive className="me-1" />
                                                        <span>{(rep.size / 1024).toFixed(1)} KB</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className="btn-evalix-secondary"
                                        onClick={() => handleDownload(rep.url || `/api/papers/reports/${rep.filename}`, rep.filename)}
                                        disabled={downloading === rep.filename}
                                    >
                                        <FiDownload className="me-2" />
                                        {downloading === rep.filename ? 'Downloading...' : 'Download'}
                                    </button>
                                </div>
                            ))
                    ) : (
                        !currentReport && (
                            <div className="no-reports-placeholder text-center py-5">
                                <FiFileText className="empty-icon text-muted mb-2" style={{ fontSize: '2rem' }} />
                                <div className="text-secondary">No previous reports found.</div>
                                <small className="text-muted">Analyze your first paper to generate downloadable reports.</small>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportsList;
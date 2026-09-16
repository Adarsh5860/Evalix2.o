import React, { useState, useEffect } from 'react';
import { 
    FiAward, 
    FiFileText, 
    FiCheckCircle, 
    FiAlertCircle, 
    FiClock, 
    FiLayers, 
    FiCheck, 
    FiX, 
    FiRefreshCw, 
    FiArrowRight, 
    FiInfo,
    FiShield
} from 'react-icons/fi';
import { getReportsList, runQualityCheckApi } from '../services/api';
import '../styles/QualityCheckPanel.scss';

const DOCUMENT_TYPES = [
    { 
        id: 'Mini Project Report', 
        name: 'Mini Project Report', 
        shortDesc: '6 Core Sections • Mid-level Bloom\'s focus' 
    },
    { 
        id: 'Project Report', 
        name: 'Project Report', 
        shortDesc: '10 Sections • Apply, Analyze & Evaluate' 
    },
    { 
        id: 'Dissertation', 
        name: 'Dissertation', 
        shortDesc: '10 Sections • Higher-Order Analyze & Synthesize' 
    },
    { 
        id: 'Technical Report', 
        name: 'Technical Report', 
        shortDesc: '9 Sections • Spec, Architecture & Validation' 
    }
];

const QualityCheckPanel = () => {
    const [reports, setReports] = useState([]);
    const [loadingReports, setLoadingReports] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [selectedDocType, setSelectedDocType] = useState('Project Report');
    const [runningCheck, setRunningCheck] = useState(false);
    const [qualityResult, setQualityResult] = useState(null);
    const [error, setError] = useState(null);

    // Fetch previously analyzed reports
    useEffect(() => {
        setLoadingReports(true);
        getReportsList()
            .then(res => {
                if (res?.data?.reports) {
                    // Filter out master history spreadsheet
                    const validReports = res.data.reports.filter(r => r.filename !== 'analysis_history.xlsx');
                    setReports(validReports);
                    if (validReports.length > 0) {
                        // Auto-select most recent report
                        setSelectedReport(validReports[0]);
                    }
                }
            })
            .catch(err => {
                console.warn('Failed to load reports for quality check:', err);
                setError('Failed to load reports list. Please ensure the backend server is running.');
            })
            .finally(() => setLoadingReports(false));
    }, []);

    const formatDate = (isoString) => {
        if (!isoString) return 'Recently Analyzed';
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleRunQualityCheck = async () => {
        if (!selectedReport || !selectedDocType || runningCheck) return;

        try {
            setRunningCheck(true);
            setError(null);

            const response = await runQualityCheckApi(selectedReport.filename, selectedDocType);
            if (response && response.data && response.data.qualityScore) {
                setQualityResult(response.data.qualityScore);
            } else {
                throw new Error('Quality check completed but returned no scoring data.');
            }
        } catch (err) {
            console.error('Quality check execution failed:', err);
            const msg = err.response?.data?.error || err.message || 'Failed to complete quality check.';
            setError(msg);
        } finally {
            setRunningCheck(false);
        }
    };

    // Color helpers for score bars
    const getScoreBarColor = (score) => {
        if (score >= 85) return '#10B981'; // Green
        if (score >= 70) return '#3B82F6'; // Blue
        if (score >= 50) return '#F59E0B'; // Amber
        return '#EF4444';                  // Red
    };

    return (
        <div className="evalix-dashboard-page quality-check-page">
            {/* Header */}
            <div className="page-header-block mb-4">
                <div className="header-badge">
                    <span className="badge-sparkle">✦</span>
                    <span>Document Type Quality Quantification</span>
                </div>
                <h1 className="header-title">
                    Quality <span className="gradient-text">Check</span>
                </h1>
                <p className="header-subtitle">
                    Select an existing report to quantify its structural completeness and Bloom's Taxonomy cognitive alignment against institutional rubrics.
                </p>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="evalix-alert-banner alert-error mb-4 animate-fade-in">
                    <FiAlertCircle className="alert-icon" />
                    <div className="alert-message">{error}</div>
                    <button className="alert-close-btn" onClick={() => setError(null)}>×</button>
                </div>
            )}

            {/* Main Interactive Configuration Grid */}
            <div className="qc-config-grid mb-4">
                {/* Section A: Select Report Card */}
                <div className="qc-card glass-panel reports-selection-card">
                    <div className="card-header-row">
                        <div className="card-header-left">
                            <span className="step-tag">Step 1</span>
                            <h3 className="section-title">Select Analyzed Report</h3>
                        </div>
                        <span className="reports-count-tag">{reports.length} Available</span>
                    </div>

                    {loadingReports ? (
                        <div className="loading-state-box">
                            <span className="button-spinner"></span>
                            <span>Loading available reports...</span>
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="empty-reports-hint">
                            <FiFileText className="hint-icon" />
                            <p>No previous reports found. Please upload and analyze a document first.</p>
                        </div>
                    ) : (
                        <div className="reports-selectable-list">
                            {reports.map((report) => {
                                const isSelected = selectedReport?.filename === report.filename;
                                return (
                                    <div
                                        key={report.filename}
                                        className={`report-select-item ${isSelected ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedReport(report);
                                            // Reset active result when changing report
                                            if (selectedReport?.filename !== report.filename) {
                                                setQualityResult(null);
                                            }
                                        }}
                                    >
                                        <div className="select-radio-wrap">
                                            <div className={`custom-radio-circle ${isSelected ? 'checked' : ''}`}>
                                                {isSelected && <span className="inner-dot"></span>}
                                            </div>
                                        </div>

                                        <div className="report-item-details">
                                            <div className="report-item-filename" title={report.filename}>
                                                <FiFileText className="file-icon" />
                                                <span className="name-text">{report.filename}</span>
                                            </div>
                                            <div className="report-item-meta">
                                                <span className="meta-time">
                                                    <FiClock className="meta-icon" />
                                                    {formatDate(report.created)}
                                                </span>
                                                <span className="meta-size">
                                                    {(report.size / 1024).toFixed(1)} KB
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Section B: Document Type Selector & Action Card */}
                <div className="qc-card glass-panel doctype-action-card">
                    <div className="card-header-row">
                        <div className="card-header-left">
                            <span className="step-tag">Step 2</span>
                            <h3 className="section-title">Select Document Type</h3>
                        </div>
                    </div>

                    <p className="section-desc">
                        Select the document archetype to evaluate against expected sections and cognitive levels:
                    </p>

                    {/* Document Type Segmented Control / Filter Pills */}
                    <div className="doctype-pills-grid">
                        {DOCUMENT_TYPES.map((dt) => {
                            const isActive = selectedDocType === dt.id;
                            return (
                                <button
                                    key={dt.id}
                                    type="button"
                                    className={`doctype-pill ${isActive ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedDocType(dt.id);
                                    }}
                                >
                                    <div className="pill-header">
                                        <span className={`pill-check ${isActive ? 'checked' : ''}`}>
                                            {isActive ? <FiCheck /> : <span className="empty-dot"></span>}
                                        </span>
                                        <span className="pill-title">{dt.name}</span>
                                    </div>
                                    <span className="pill-desc">{dt.shortDesc}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Run Quality Check Action */}
                    <div className="run-action-section mt-4">
                        <button
                            type="button"
                            className="btn-run-qc"
                            disabled={!selectedReport || !selectedDocType || runningCheck}
                            onClick={handleRunQualityCheck}
                        >
                            {runningCheck ? (
                                <>
                                    <span className="button-spinner"></span>
                                    <span>Quantifying Document Quality...</span>
                                </>
                            ) : (
                                <>
                                    <FiAward className="btn-icon" />
                                    <span>Run Quality Check</span>
                                    <FiArrowRight className="arrow-icon" />
                                </>
                            )}
                        </button>

                        {!selectedReport ? (
                            <span className="qc-hint-text text-warning">
                                <FiInfo /> Select a report above to run a quality check
                            </span>
                        ) : !selectedDocType ? (
                            <span className="qc-hint-text text-warning">
                                <FiInfo /> Choose a document type to continue
                            </span>
                        ) : (
                            <span className="qc-hint-text">
                                Ready to score {selectedReport.filename.slice(0, 32)}... as {selectedDocType}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Section C: Quality Quantification Results Display */}
            {qualityResult ? (
                <div className="qc-results-container animate-fade-in">
                    {/* Results Overview Bar */}
                    <div className="qc-hero-banner glass-panel">
                        <div className="hero-left">
                            <div className="grade-badge-circle" style={{ borderColor: qualityResult.gradeColor }}>
                                <span className="grade-letter" style={{ color: qualityResult.gradeColor }}>
                                    {qualityResult.gradeBand || 'A'}
                                </span>
                                <span className="grade-sub">Grade</span>
                            </div>
                            <div className="hero-text">
                                <div className="archetype-label">
                                    Archetype: <strong>{qualityResult.documentType}</strong>
                                </div>
                                <h2 className="overall-score-heading">
                                    Overall Quality: <span style={{ color: qualityResult.gradeColor }}>{qualityResult.overallScore}</span>
                                    <span className="score-denom"> / 100</span>
                                </h2>
                                <p className="grade-desc">
                                    Qualitative Assessment: <strong style={{ color: qualityResult.gradeColor }}>{qualityResult.grade}</strong>
                                </p>
                            </div>
                        </div>

                        <div className="hero-right">
                            <button 
                                className="btn-re-score"
                                onClick={handleRunQualityCheck}
                                disabled={runningCheck}
                                title="Re-evaluate document"
                            >
                                <FiRefreshCw className={runningCheck ? 'spin' : ''} />
                                <span>Re-evaluate</span>
                            </button>
                        </div>
                    </div>

                    {/* Two-Column Dimension Breakdown */}
                    <div className="qc-metrics-two-col mt-4">
                        {/* 1. Structural Completeness Card */}
                        <div className="qc-dimension-card glass-panel">
                            <div className="dimension-header">
                                <div className="dim-title-wrap">
                                    <FiLayers className="dim-icon purple" />
                                    <div>
                                        <h3 className="dim-title">Structural Completeness</h3>
                                        <span className="dim-sub">Required headings & sections</span>
                                    </div>
                                </div>
                                <div className="dim-score-badge" style={{ color: getScoreBarColor(qualityResult.structuralScore) }}>
                                    {qualityResult.structuralScore}%
                                </div>
                            </div>

                            {/* Score progress bar */}
                            <div className="dim-progress-track">
                                <div 
                                    className="dim-progress-fill" 
                                    style={{ 
                                        width: `${qualityResult.structuralScore}%`,
                                        backgroundColor: getScoreBarColor(qualityResult.structuralScore)
                                    }}
                                ></div>
                            </div>

                            {/* Section Status Overview */}
                            <div className="section-counts-row">
                                <span>Detected: <strong>{qualityResult.foundSectionsCount || 0}</strong></span>
                                <span>Missing: <strong className="text-danger">{qualityResult.missingSections?.length || 0}</strong></span>
                                <span>Total Required: <strong>{qualityResult.totalRequiredSections || 0}</strong></span>
                            </div>

                            {/* Missing Sections Alert List */}
                            {qualityResult.missingSections && qualityResult.missingSections.length > 0 ? (
                                <div className="missing-sections-block mt-3">
                                    <div className="block-label text-danger">
                                        <FiAlertCircle className="me-1" /> Missing Required Sections:
                                    </div>
                                    <ul className="sections-tag-list">
                                        {qualityResult.missingSections.map((sec, i) => (
                                            <li key={i} className="missing-tag">
                                                <FiX className="tag-icon" />
                                                <span>{sec}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <div className="all-sections-ok mt-3">
                                    <FiCheckCircle className="ok-icon text-success" />
                                    <span>All required structural sections are present!</span>
                                </div>
                            )}

                            {/* Detected Sections Pills */}
                            {qualityResult.detectedSections && qualityResult.detectedSections.length > 0 && (
                                <div className="detected-sections-block mt-3">
                                    <div className="block-label text-muted">Detected Sections:</div>
                                    <div className="detected-pills-wrap">
                                        {qualityResult.detectedSections.map((sec, i) => (
                                            <span key={i} className="detected-pill">
                                                <FiCheck className="pill-icon" /> {sec}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. Bloom's Taxonomy Alignment Card */}
                        <div className="qc-dimension-card glass-panel">
                            <div className="dimension-header">
                                <div className="dim-title-wrap">
                                    <FiShield className="dim-icon cyan" />
                                    <div>
                                        <h3 className="dim-title">Bloom's Alignment Score</h3>
                                        <span className="dim-sub">Cognitive level distribution profile</span>
                                    </div>
                                </div>
                                <div className="dim-score-badge" style={{ color: getScoreBarColor(qualityResult.bloomsAlignmentScore) }}>
                                    {qualityResult.bloomsAlignmentScore}%
                                </div>
                            </div>

                            {/* Score progress bar */}
                            <div className="dim-progress-track">
                                <div 
                                    className="dim-progress-fill" 
                                    style={{ 
                                        width: `${qualityResult.bloomsAlignmentScore}%`,
                                        backgroundColor: getScoreBarColor(qualityResult.bloomsAlignmentScore)
                                    }}
                                ></div>
                            </div>

                            {/* Misaligned Levels List */}
                            <div className="misaligned-feedback-block mt-3">
                                <div className="block-label">Alignment Feedback:</div>
                                {qualityResult.misalignedLevels && qualityResult.misalignedLevels.length > 0 ? (
                                    <ul className="feedback-bullets-list">
                                        {qualityResult.misalignedLevels.map((feedback, idx) => (
                                            <li key={idx} className="feedback-bullet-item">
                                                <span className="bullet-dot"></span>
                                                <span>{feedback}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="all-sections-ok">
                                        <FiCheckCircle className="ok-icon text-success" />
                                        <span>Cognitive verb levels closely match expected distribution profile.</span>
                                    </div>
                                )}
                            </div>

                            {/* Distribution Comparison Table */}
                            {qualityResult.expectedDistribution && (
                                <div className="distribution-comparison mt-3">
                                    <div className="block-label text-muted mb-2">Cognitive Distribution Comparison:</div>
                                    <div className="table-responsive">
                                        <table className="mini-dist-table">
                                            <thead>
                                                <tr>
                                                    <th>Level</th>
                                                    <th className="text-center">Actual</th>
                                                    <th className="text-center">Expected</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.keys(qualityResult.expectedDistribution).map((level) => {
                                                    const actualVal = Math.round((qualityResult.actualDistribution?.[level] || 0) * 100);
                                                    const expectedVal = Math.round((qualityResult.expectedDistribution[level] || 0) * 100);
                                                    return (
                                                        <tr key={level}>
                                                            <td className="level-name">
                                                                {level.charAt(0).toUpperCase() + level.slice(1)}
                                                            </td>
                                                            <td className="text-center actual-cell">
                                                                {actualVal}%
                                                            </td>
                                                            <td className="text-center expected-cell text-muted">
                                                                {expectedVal}%
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                /* Empty Placeholder State */
                <div className="qc-empty-placeholder glass-panel text-center py-5">
                    <div className="empty-icon-ring">
                        <FiAward className="empty-main-icon" />
                    </div>
                    <h3 className="empty-title">Select a report above to run a quality check</h3>
                    <p className="empty-desc">
                        Choose an analyzed document and document type, then click <strong>"Run Quality Check"</strong> to quantify structural completeness and Bloom's Taxonomy cognitive alignment.
                    </p>
                </div>
            )}
        </div>
    );
};

export default QualityCheckPanel;

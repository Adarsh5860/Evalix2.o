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
    FiShield,
    FiSearch,
    FiFolder,
    FiBookOpen,
    FiCpu,
    FiZap,
    FiTrendingUp
} from 'react-icons/fi';
import { getReportsList, runQualityCheckApi } from '../services/api';
import '../styles/QualityCheckPanel.scss';

const DOCUMENT_TYPES = [
    { 
        id: 'Mini Project Report', 
        name: 'Mini Project Report', 
        sections: 6,
        badge: '6 Sections',
        focus: 'Practical Execution',
        shortDesc: 'Abstract, Objectives, Methodology, Implementation, Results, Conclusion',
        bloomsTag: 'Apply & Analyze Focus',
        icon: 'folder'
    },
    { 
        id: 'Project Report', 
        name: 'Project Report', 
        sections: 10,
        badge: '10 Sections',
        focus: 'Comprehensive Engineering',
        shortDesc: 'Full SDLC: Architecture, Implementation, Testing & Validation',
        bloomsTag: 'Apply, Analyze & Evaluate',
        icon: 'layers'
    },
    { 
        id: 'Dissertation', 
        name: 'Dissertation', 
        sections: 10,
        badge: '10 Sections',
        focus: 'Academic Research',
        shortDesc: 'Hypothesis, Theoretical Framework, Empirical Analysis & Synthesis',
        bloomsTag: 'Higher-Order Synthesis',
        icon: 'book'
    },
    { 
        id: 'Technical Report', 
        name: 'Technical Report', 
        sections: 9,
        badge: '9 Sections',
        focus: 'Specs & Architecture',
        shortDesc: 'Problem Spec, Architecture, Implementation Details & Benchmarks',
        bloomsTag: 'Specs & Validation',
        icon: 'cpu'
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
    const [searchQuery, setSearchQuery] = useState('');

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

    const getCleanName = (filename) => {
        if (!filename) return '';
        return filename
            .replace(/_analysis_\d+\.xlsx$/i, '')
            .replace(/_/g, ' ');
    };

    const handleRunQualityCheck = async () => {
        if (!selectedReport || !selectedDocType || runningCheck) return;

        try {
            setRunningCheck(true);
            setError(null);

            const response = await runQualityCheckApi(selectedReport.filename, selectedDocType);
            if (response && response.data && response.data.qualityScore) {
                setQualityResult(response.data.qualityScore);
                // Smooth scroll to results
                setTimeout(() => {
                    const resultsEl = document.getElementById('qc-results-section');
                    if (resultsEl) {
                        resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 100);
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

    const renderArchetypeIcon = (iconType) => {
        switch (iconType) {
            case 'folder':
                return <FiFolder className="archetype-icon-svg" />;
            case 'book':
                return <FiBookOpen className="archetype-icon-svg" />;
            case 'cpu':
                return <FiCpu className="archetype-icon-svg" />;
            case 'layers':
            default:
                return <FiLayers className="archetype-icon-svg" />;
        }
    };

    // Color helpers for score bars
    const getScoreBarColor = (score) => {
        if (score >= 85) return '#10B981'; // Emerald Green
        if (score >= 70) return '#3B82F6'; // Blue
        if (score >= 50) return '#F59E0B'; // Amber
        return '#EF4444';                  // Red
    };

    const getAlignmentStatus = (diff) => {
        if (diff <= -12) return { text: 'Low Emphasis', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)' };
        if (diff >= 18) return { text: 'Excessive', color: '#EC4899', bg: 'rgba(236, 72, 153, 0.12)' };
        return { text: 'Aligned', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' };
    };

    const filteredReports = reports.filter(r => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return r.filename.toLowerCase().includes(q) || getCleanName(r.filename).toLowerCase().includes(q);
    });

    const activeArchetype = DOCUMENT_TYPES.find(d => d.id === selectedDocType) || DOCUMENT_TYPES[1];

    return (
        <div className="evalix-dashboard-page quality-check-page">
            {/* Page Header */}
            <div className="page-header-block mb-4">
                <div className="header-badge">
                    <span className="badge-sparkle">✦</span>
                    <span>Document Type Quality Quantification</span>
                </div>
                <h1 className="header-title">
                    Quality <span className="gradient-text">Check</span>
                </h1>
                <p className="header-subtitle">
                    Select an analyzed document to quantify its structural completeness and Bloom's Taxonomy cognitive alignment against institutional rubrics.
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
                {/* Step 1: Select Analyzed Report Card */}
                <div className="qc-card glass-panel reports-selection-card">
                    <div className="card-header-row">
                        <div className="card-header-left">
                            <span className="step-tag">Step 1</span>
                            <h3 className="section-title">Select Analyzed Report</h3>
                        </div>
                        <span className="reports-count-tag">{reports.length} Available</span>
                    </div>

                    <p className="section-desc">
                        Choose a previously processed document analysis to evaluate against quality rubrics:
                    </p>

                    {/* Quick Search Bar */}
                    <div className="reports-search-box mb-3">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Filter reports by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="reports-search-input"
                        />
                        {searchQuery && (
                            <button 
                                className="search-clear-btn" 
                                onClick={() => setSearchQuery('')}
                                title="Clear search"
                            >
                                <FiX />
                            </button>
                        )}
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
                    ) : filteredReports.length === 0 ? (
                        <div className="empty-reports-hint">
                            <FiSearch className="hint-icon" />
                            <p>No reports match "{searchQuery}". Try a different keyword.</p>
                        </div>
                    ) : (
                        <div className="reports-selectable-list">
                            {filteredReports.map((report) => {
                                const isSelected = selectedReport?.filename === report.filename;
                                return (
                                    <div
                                        key={report.filename}
                                        className={`report-select-item ${isSelected ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedReport(report);
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
                                                <div className="file-badge">XLSX</div>
                                                <span className="name-text">{getCleanName(report.filename)}</span>
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

                {/* Step 2: Document Archetype Selector Card */}
                <div className="qc-card glass-panel doctype-action-card">
                    <div className="card-header-row">
                        <div className="card-header-left">
                            <span className="step-tag cyan">Step 2</span>
                            <h3 className="section-title">Select Document Archetype</h3>
                        </div>
                        <span className="archetype-count-tag">4 Archetypes</span>
                    </div>

                    <p className="section-desc">
                        Select the target document archetype to evaluate against expected sections and cognitive levels:
                    </p>

                    {/* Document Type Grid */}
                    <div className="doctype-pills-grid">
                        {DOCUMENT_TYPES.map((dt) => {
                            const isActive = selectedDocType === dt.id;
                            return (
                                <button
                                    key={dt.id}
                                    type="button"
                                    className={`doctype-pill ${isActive ? 'active' : ''}`}
                                    onClick={() => setSelectedDocType(dt.id)}
                                >
                                    <div className="pill-top-row">
                                        <div className="pill-icon-wrap">
                                            {renderArchetypeIcon(dt.icon)}
                                        </div>
                                        <div className="pill-top-right">
                                            <span className="pill-badge">{dt.badge}</span>
                                            <span className={`pill-check ${isActive ? 'checked' : ''}`}>
                                                {isActive ? <FiCheck /> : <span className="empty-dot"></span>}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pill-title">{dt.name}</div>
                                    <div className="pill-tag">{dt.bloomsTag}</div>
                                    <p className="pill-desc">{dt.shortDesc}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Action Bar / Evaluation Strip */}
            <div className="qc-action-strip glass-panel mb-5">
                <div className="action-strip-info">
                    <div className="strip-info-icon">
                        <FiZap />
                    </div>
                    <div className="strip-info-text">
                        <div className="strip-info-title">
                            Ready for Quality Evaluation
                        </div>
                        <div className="strip-info-summary">
                            {selectedReport ? (
                                <>
                                    Target: <span className="highlight-tag report-tag" title={selectedReport.filename}>{getCleanName(selectedReport.filename)}</span>
                                    <FiArrowRight className="inline-arrow" />
                                    Archetype: <span className="highlight-tag archetype-tag">{selectedDocType} ({activeArchetype.badge})</span>
                                </>
                            ) : (
                                <span className="text-warning">Select an analyzed report above to begin evaluation</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="action-strip-button-wrap">
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
                </div>
            </div>

            {/* Quality Quantification Results Display */}
            {qualityResult ? (
                <div id="qc-results-section" className="qc-results-container animate-fade-in">
                    {/* Hero Score Banner */}
                    <div className="qc-hero-banner glass-panel">
                        <div className="hero-left">
                            <div 
                                className="grade-badge-circle" 
                                style={{ 
                                    borderColor: qualityResult.gradeColor,
                                    boxShadow: `0 0 25px ${qualityResult.gradeColor}40`,
                                    backgroundColor: `${qualityResult.gradeColor}15`
                                }}
                            >
                                <span className="grade-letter" style={{ color: qualityResult.gradeColor }}>
                                    {qualityResult.gradeBand || 'A'}
                                </span>
                                <span className="grade-sub">Grade</span>
                            </div>
                            <div className="hero-text">
                                <div className="hero-tags-row">
                                    <span className="archetype-badge">
                                        Archetype: <strong>{qualityResult.documentType}</strong>
                                    </span>
                                    <span 
                                        className="grade-chip" 
                                        style={{ 
                                            color: qualityResult.gradeColor,
                                            backgroundColor: `${qualityResult.gradeColor}18`,
                                            borderColor: `${qualityResult.gradeColor}40`
                                        }}
                                    >
                                        Assessment: {qualityResult.grade}
                                    </span>
                                </div>
                                <h2 className="overall-score-heading">
                                    Overall Quality Score: <span className="score-val-wrap">
                                        <span style={{ color: qualityResult.gradeColor }}>{qualityResult.overallScore}</span>
                                        <span className="score-denom"> / 100</span>
                                    </span>
                                </h2>
                                <p className="hero-meta-desc">
                                    Evaluated against institutional rubrics with 50% structural completeness weighting and 50% Bloom's cognitive taxonomy alignment.
                                </p>
                            </div>
                        </div>

                        <div className="hero-right">
                            <div className="hero-mini-scores">
                                <div className="mini-score-box">
                                    <span className="mini-score-val" style={{ color: getScoreBarColor(qualityResult.structuralScore) }}>
                                        {qualityResult.structuralScore}%
                                    </span>
                                    <span className="mini-score-label">Structural</span>
                                </div>
                                <div className="mini-score-box">
                                    <span className="mini-score-val" style={{ color: getScoreBarColor(qualityResult.bloomsAlignmentScore) }}>
                                        {qualityResult.bloomsAlignmentScore}%
                                    </span>
                                    <span className="mini-score-label">Cognitive</span>
                                </div>
                            </div>

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
                                    <div className="dim-icon-box purple">
                                        <FiLayers />
                                    </div>
                                    <div>
                                        <h3 className="dim-title">Structural Completeness</h3>
                                        <span className="dim-sub">Required headings & structural rubric sections</span>
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

                            {/* Section Status Overview Strip */}
                            <div className="section-counts-row">
                                <div className="count-stat-item">
                                    <span className="stat-label">Detected:</span>
                                    <strong className="stat-val text-success">{qualityResult.foundSectionsCount || 0}</strong>
                                </div>
                                <div className="count-stat-item">
                                    <span className="stat-label">Missing:</span>
                                    <strong className="stat-val text-danger">{qualityResult.missingSections?.length || 0}</strong>
                                </div>
                                <div className="count-stat-item">
                                    <span className="stat-label">Total Required:</span>
                                    <strong className="stat-val">{qualityResult.totalRequiredSections || 0}</strong>
                                </div>
                            </div>

                            {/* Missing Sections Alert List */}
                            {qualityResult.missingSections && qualityResult.missingSections.length > 0 ? (
                                <div className="missing-sections-block mt-3">
                                    <div className="block-label text-danger">
                                        <FiAlertCircle className="me-1 inline-icon" /> 
                                        Missing Required Sections ({qualityResult.missingSections.length}):
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
                                    <span>All required structural sections are present and verified!</span>
                                </div>
                            )}

                            {/* Detected Sections Pills */}
                            {qualityResult.detectedSections && qualityResult.detectedSections.length > 0 && (
                                <div className="detected-sections-block mt-3">
                                    <div className="block-label text-muted">
                                        <FiCheckCircle className="me-1 inline-icon text-success" />
                                        Detected Sections ({qualityResult.detectedSections.length}):
                                    </div>
                                    <div className="detected-pills-wrap">
                                        {qualityResult.detectedSections.map((sec, i) => (
                                            <span key={i} className="detected-pill">
                                                <FiCheck className="pill-icon" /> {sec}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Improvement Tip */}
                            {qualityResult.missingSections && qualityResult.missingSections.length > 0 && (
                                <div className="qc-tip-box mt-3">
                                    <FiTrendingUp className="tip-icon" />
                                    <span className="tip-text">
                                        Adding the missing sections ({qualityResult.missingSections.slice(0, 3).join(', ')}
                                        {qualityResult.missingSections.length > 3 ? '...' : ''}) would elevate this report's structural completeness to 100%.
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* 2. Bloom's Taxonomy Alignment Card */}
                        <div className="qc-dimension-card glass-panel">
                            <div className="dimension-header">
                                <div className="dim-title-wrap">
                                    <div className="dim-icon-box cyan">
                                        <FiShield />
                                    </div>
                                    <div>
                                        <h3 className="dim-title">Bloom's Taxonomy Alignment</h3>
                                        <span className="dim-sub">Cognitive level distribution vs archetype profile</span>
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

                            {/* Alignment Feedback */}
                            <div className="misaligned-feedback-block mt-3">
                                <div className="block-label">Taxonomy Alignment Insights:</div>
                                {qualityResult.misalignedLevels && qualityResult.misalignedLevels.length > 0 ? (
                                    <ul className="feedback-bullets-list">
                                        {qualityResult.misalignedLevels.map((feedback, idx) => (
                                            <li key={idx} className="feedback-bullet-item">
                                                <FiAlertCircle className="feedback-icon" />
                                                <span>{feedback}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="all-sections-ok">
                                        <FiCheckCircle className="ok-icon text-success" />
                                        <span>Cognitive verb levels closely match the expected distribution profile.</span>
                                    </div>
                                )}
                            </div>

                            {/* Cognitive Distribution Comparison Visual Bars */}
                            {qualityResult.expectedDistribution && (
                                <div className="distribution-comparison mt-3">
                                    <div className="block-label text-muted mb-2">Cognitive Distribution Comparison:</div>
                                    <div className="dist-bars-container">
                                        {Object.keys(qualityResult.expectedDistribution).map((level) => {
                                            const actualVal = Math.round((qualityResult.actualDistribution?.[level] || 0) * 100);
                                            const expectedVal = Math.round((qualityResult.expectedDistribution[level] || 0) * 100);
                                            const diff = actualVal - expectedVal;
                                            const status = getAlignmentStatus(diff);

                                            return (
                                                <div key={level} className="dist-level-row">
                                                    <div className="dist-level-header">
                                                        <span className="level-title">
                                                            {level.charAt(0).toUpperCase() + level.slice(1)}
                                                        </span>
                                                        <div className="dist-level-meta">
                                                            <span className="diff-chip" style={{ color: status.color, backgroundColor: status.bg }}>
                                                                {status.text}
                                                            </span>
                                                            <span className="actual-stat">
                                                                Actual: <strong>{actualVal}%</strong>
                                                            </span>
                                                            <span className="expected-stat">
                                                                Expected: <strong>{expectedVal}%</strong>
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="dist-bar-track">
                                                        {/* Actual progress */}
                                                        <div 
                                                            className="dist-bar-actual" 
                                                            style={{ 
                                                                width: `${Math.min(100, actualVal)}%`,
                                                                backgroundColor: status.color
                                                            }}
                                                        ></div>
                                                        {/* Expected indicator line */}
                                                        <div 
                                                            className="dist-bar-expected-marker" 
                                                            style={{ left: `${Math.min(99, expectedVal)}%` }}
                                                            title={`Expected: ${expectedVal}%`}
                                                        ></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
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
                    <h3 className="empty-title">Document Quality Quantification Ready</h3>
                    <p className="empty-desc">
                        Select an analyzed report in <strong>Step 1</strong> and document archetype in <strong>Step 2</strong>, then click <strong>"Run Quality Check"</strong> to quantify structural completeness and Bloom's Taxonomy cognitive alignment.
                    </p>
                    <div className="empty-features-row">
                        <div className="empty-feature-item">
                            <FiCheckCircle className="feat-icon" />
                            <span>100% Automated Structural Verification</span>
                        </div>
                        <div className="empty-feature-item">
                            <FiShield className="feat-icon" />
                            <span>Cognitive Taxonomy Distribution Check</span>
                        </div>
                        <div className="empty-feature-item">
                            <FiAward className="feat-icon" />
                            <span>Rubric-Based Grade Banding & Tips</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QualityCheckPanel;

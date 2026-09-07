// components/RecommendationsDashboard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiBookOpen, 
    FiHeart, 
    FiActivity, 
    FiDownload,
    FiCheckCircle, 
    FiAlertCircle,
    FiUpload,
    FiTrendingUp
} from 'react-icons/fi';
import '../styles/RecommendationsDashboard.scss';

const RecommendationsDashboard = ({ recommendations, report, onLoadSample }) => {
    const navigate = useNavigate();

    if (!recommendations) {
        return (
            <div className="evalix-dashboard-page">
                <div className="empty-analysis-card glass-panel text-center py-5 px-4">
                    <div className="empty-icon-wrap">
                        <FiAlertCircle className="empty-icon" />
                    </div>
                    <h2 className="empty-title">No Recommendations Available</h2>
                    <p className="empty-desc">
                        Upload and analyze a research paper or syllabus to receive AI-powered educational recommendations and Bloom's Taxonomy gap analyses.
                    </p>
                    <div className="empty-actions-row">
                        <button className="btn-evalix-primary" onClick={() => navigate('/upload')}>
                            <FiUpload className="me-2" />
                            Upload Document
                        </button>
                        {onLoadSample && (
                            <button className="btn-evalix-secondary" onClick={onLoadSample}>
                                <FiTrendingUp className="me-2" />
                                Load Sample Analysis
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="evalix-dashboard-page recommendations-page">
            {/* Main Assessment Header Card */}
            <div className="assessment-hero-card glass-panel mb-4">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                    <div>
                        <div className="header-badge mb-2">
                            <span className="badge-sparkle">✦</span>
                            <span>Curriculum Optimization</span>
                        </div>
                        <h2 className="assessment-title">Educational Focus Assessment</h2>
                        <p className="assessment-lead-text">{recommendations.main}</p>
                    </div>

                    {report && (
                        <a
                            href={report.url}
                            className="btn-evalix-primary"
                            download={report.filename}
                        >
                            <FiDownload className="me-2" />
                            Download Excel Report
                        </a>
                    )}
                </div>
            </div>

            {/* 3 Domain Specific Cards */}
            <div className="recommendations-domain-grid mb-4">
                {/* Cognitive */}
                <div className="domain-rec-card glass-panel border-purple">
                    <div className="card-rec-header">
                        <div className="rec-icon-box purple">
                            <FiBookOpen />
                        </div>
                        <h4 className="rec-title">Cognitive Domain</h4>
                    </div>
                    <p className="rec-body-text">{recommendations.cognitive}</p>
                </div>

                {/* Affective */}
                <div className="domain-rec-card glass-panel border-magenta">
                    <div className="card-rec-header">
                        <div className="rec-icon-box magenta">
                            <FiHeart />
                        </div>
                        <h4 className="rec-title">Affective Domain</h4>
                    </div>
                    <p className="rec-body-text">{recommendations.affective}</p>
                </div>

                {/* Psychomotor */}
                <div className="domain-rec-card glass-panel border-cyan">
                    <div className="card-rec-header">
                        <div className="rec-icon-box cyan">
                            <FiActivity />
                        </div>
                        <h4 className="rec-title">Psychomotor Domain</h4>
                    </div>
                    <p className="rec-body-text">{recommendations.psychomotor}</p>
                </div>
            </div>

            {/* Implementation Strategies Card */}
            <div className="implementation-card glass-panel">
                <div className="impl-header mb-4">
                    <h3 className="impl-title">Recommended Implementation Strategies</h3>
                    <p className="impl-sub">Concrete pedagogical adjustments based on taxonomy findings</p>
                </div>

                <div className="strategies-grid">
                    {/* Cognitive Strategies */}
                    <div className="strategy-col">
                        <div className="strategy-header purple-text">
                            <FiCheckCircle className="strategy-check" />
                            <span>For Cognitive Balance</span>
                        </div>
                        <ul className="strategy-list">
                            <li>Balance lower-order and higher-order thinking tasks.</li>
                            <li>Introduce explicit analysis and evaluation inquiry verbs.</li>
                            <li>Structure progressive cognitive development trajectories.</li>
                            <li>Pair synthesis activities with foundational recall tasks.</li>
                        </ul>
                    </div>

                    {/* Affective Strategies */}
                    <div className="strategy-col">
                        <div className="strategy-header magenta-text">
                            <FiCheckCircle className="strategy-check" />
                            <span>For Affective Engagement</span>
                        </div>
                        <ul className="strategy-list">
                            <li>Incorporate reflective and value-driven learning tasks.</li>
                            <li>Foster collaborative discussions that develop personal attitudes.</li>
                            <li>Balance reception of content with ethical internalization.</li>
                            <li>Address motivation, ownership, and student agency.</li>
                        </ul>
                    </div>

                    {/* Psychomotor Strategies */}
                    <div className="strategy-col">
                        <div className="strategy-header cyan-text">
                            <FiCheckCircle className="strategy-check" />
                            <span>For Psychomotor Action</span>
                        </div>
                        <ul className="strategy-list">
                            <li>Increase hands-on and kinesthetic execution tasks.</li>
                            <li>Create structured physical and procedural skill progression ladders.</li>
                            <li>Bridge theoretical instruction with concrete experimentation.</li>
                            <li>Provide guided iterative practice opportunities with rapid feedback.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecommendationsDashboard;
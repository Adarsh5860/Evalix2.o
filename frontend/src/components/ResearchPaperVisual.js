// components/ResearchPaperVisual.js
import React, { useState, useEffect } from 'react';
import { FiFileText, FiCpu, FiCompass, FiAward } from 'react-icons/fi';
import { getDashboardStats } from '../services/api';
import '../styles/ResearchPaperVisual.scss';

const ResearchPaperVisual = ({ currentStats }) => {
    const [stats, setStats] = useState({
        papersAnalyzed: 1,
        accuracyRate: '96.8%',
        taxonomyDomains: 3
    });

    useEffect(() => {
        if (currentStats) {
            setStats(prev => ({ ...prev, ...currentStats }));
        } else {
            // Fetch stats from backend
            getDashboardStats()
                .then(res => {
                    if (res?.data) {
                        setStats({
                            papersAnalyzed: res.data.papersAnalyzed || 1,
                            accuracyRate: res.data.accuracyRate || '96.8%',
                            taxonomyDomains: res.data.taxonomyDomains || 3
                        });
                    }
                })
                .catch(err => console.warn('Could not load stats:', err));
        }
    }, [currentStats]);

    return (
        <div className="research-paper-visual-container">
            {/* Ambient Background Glows */}
            <div className="visual-glow visual-glow-purple"></div>
            <div className="visual-glow visual-glow-blue"></div>

            {/* Central Floating Document Representation */}
            <div className="visual-scene">
                {/* Satellite Card 1: Top Left */}
                <div className="satellite-card satellite-top-left animate-float-slow">
                    <div className="satellite-icon-box purple">
                        <FiCpu />
                    </div>
                    <div className="satellite-text">
                        <span className="sat-title">Analyze</span>
                        <span className="sat-sub">Action Verbs</span>
                    </div>
                </div>

                {/* Satellite Card 2: Top Right */}
                <div className="satellite-card satellite-top-right animate-float-delayed">
                    <div className="satellite-icon-box blue">
                        <FiCompass />
                    </div>
                    <div className="satellite-text">
                        <span className="sat-title">Classify</span>
                        <span className="sat-sub">by Domains</span>
                    </div>
                </div>

                {/* Center Main Document Card */}
                <div className="main-paper-card animate-float-main">
                    <div className="paper-header">
                        <div className="paper-tag">
                            <FiFileText className="paper-icon" />
                            <span>Research Paper</span>
                        </div>
                        <div className="paper-status-dot"></div>
                    </div>

                    <div className="paper-body">
                        <div className="paper-title-placeholder">
                            <div className="line line-title-1"></div>
                            <div className="line line-title-2"></div>
                        </div>

                        <div className="paper-meta-pills">
                            <span className="meta-pill pill-purple">Bloom: Cognitive</span>
                            <span className="meta-pill pill-cyan">768-d Vector</span>
                        </div>

                        <div className="paper-lines">
                            <div className="line line-text"></div>
                            <div className="line line-text short"></div>
                            <div className="line line-text medium"></div>
                            <div className="line line-highlight">
                                <span className="verb-tag">synthesize</span>
                                <span className="verb-tag">evaluate</span>
                                <span className="verb-tag">apply</span>
                            </div>
                            <div className="line line-text"></div>
                            <div className="line line-text short"></div>
                        </div>
                    </div>

                    <div className="paper-footer">
                        <div className="paper-metric">
                            <span className="label">Confidence</span>
                            <span className="value">98.4%</span>
                        </div>
                        <div className="paper-metric">
                            <span className="label">Verbs Detected</span>
                            <span className="value">42+</span>
                        </div>
                    </div>
                </div>

                {/* Satellite Card 3: Bottom Center */}
                <div className="satellite-card satellite-bottom animate-float-reverse">
                    <div className="satellite-icon-box cyan">
                        <FiAward />
                    </div>
                    <div className="satellite-text">
                        <span className="sat-title">Gain</span>
                        <span className="sat-sub">Insights</span>
                    </div>
                </div>
            </div>

            {/* Quote with glowing underline */}
            <div className="product-quote-wrap">
                <blockquote className="product-quote">
                    “From Academic Content<br />
                    to Meaningful Change.”
                </blockquote>
                <div className="quote-underline"></div>
            </div>

            {/* Statistics Card */}
            <div className="visual-stats-card glass-panel">
                <div className="stat-col">
                    <div className="stat-number gradient-text">{stats.papersAnalyzed}+</div>
                    <div className="stat-label-primary">Papers</div>
                    <div className="stat-label-sub">Analyzed</div>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-col">
                    <div className="stat-number gradient-text-cyan">{stats.accuracyRate}</div>
                    <div className="stat-label-primary">Accuracy</div>
                    <div className="stat-label-sub">Rate</div>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-col">
                    <div className="stat-number gradient-text">{stats.taxonomyDomains}</div>
                    <div className="stat-label-primary">Taxonomy</div>
                    <div className="stat-label-sub">Domains</div>
                </div>
            </div>
        </div>
    );
};

export default ResearchPaperVisual;

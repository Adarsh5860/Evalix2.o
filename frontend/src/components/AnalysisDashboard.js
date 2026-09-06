// components/AnalysisDashboard.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
    FiBarChart2, 
    FiFileText, 
    FiDownload, 
    FiList, 
    FiUpload, 
    FiTrendingUp
} from 'react-icons/fi';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { exportAnalysisToExcel } from '../services/api';
import '../styles/AnalysisDashboard.scss';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    ChartDataLabels
);

// Consistent Evalix 2.0 taxonomy colors
const DOMAIN_COLORS = {
    cognitive: {
        primary: '#7C3AED',
        secondary: '#A855F7',
        border: 'rgba(124, 58, 237, 1)',
        glow: 'rgba(124, 58, 237, 0.4)'
    },
    affective: {
        primary: '#EC4899',
        secondary: '#F472B6',
        border: 'rgba(236, 72, 153, 1)',
        glow: 'rgba(236, 72, 153, 0.4)'
    },
    psychomotor: {
        primary: '#22D3EE',
        secondary: '#38BDF8',
        border: 'rgba(34, 211, 238, 1)',
        glow: 'rgba(34, 211, 238, 0.4)'
    },
    unclassified: {
        primary: '#64748B',
        secondary: '#94A3B8',
        border: 'rgba(100, 116, 139, 1)',
        glow: 'rgba(100, 116, 139, 0.3)'
    }
};

const AnalysisDashboard = ({ data, onLoadSample }) => {
    const [chartMode, setChartMode] = useState('doughnut'); // 'doughnut' | 'pie'
    const [isExporting, setIsExporting] = useState(false);
    const [exportError, setExportError] = useState(null);
    const navigate = useNavigate();

    const handleExportExcel = async () => {
        if (!data) return;
        try {
            setIsExporting(true);
            setExportError(null);
            await exportAnalysisToExcel(data, report?.filename || 'paper_analysis.xlsx');
        } catch (err) {
            console.error('Export error:', err);
            setExportError('Failed to export Excel. Please ensure the backend server is running on port 5001.');
        } finally {
            setIsExporting(false);
        }
    };

    // If no data, show a dark empty state with actions
    if (!data || !data.domains) {
        return (
            <div className="evalix-dashboard-page">
                <div className="empty-analysis-card glass-panel text-center py-5 px-4">
                    <div className="empty-icon-wrap">
                        <FiBarChart2 className="empty-icon" />
                    </div>
                    <h2 className="empty-title">No Analysis Data Available</h2>
                    <p className="empty-desc">
                        Upload and analyze your research paper, syllabus or educational document to generate Bloom's Taxonomy charts, domain distributions, and verb metrics.
                    </p>
                    <div className="empty-actions-row">
                        <button 
                            className="btn-evalix-primary"
                            onClick={() => navigate('/')}
                        >
                            <FiUpload className="me-2" />
                            Upload Document Now
                        </button>
                        {onLoadSample && (
                            <button 
                                className="btn-evalix-secondary"
                                onClick={onLoadSample}
                            >
                                <FiTrendingUp className="me-2" />
                                Load Sample Analysis
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const { domains, documentInfo, totalVerbCount, uniqueVerbCount, verbsByFrequency, report } = data;

    // Filtered data for domain distribution
    const preparePieChartData = () => {
        const labels = [];
        const counts = [];
        const backgroundColors = [];
        const borderColors = [];

        if (domains.cognitive?.count > 0) {
            labels.push('Cognitive');
            counts.push(domains.cognitive.count);
            backgroundColors.push(DOMAIN_COLORS.cognitive.primary);
            borderColors.push(DOMAIN_COLORS.cognitive.border);
        }
        if (domains.affective?.count > 0) {
            labels.push('Affective');
            counts.push(domains.affective.count);
            backgroundColors.push(DOMAIN_COLORS.affective.primary);
            borderColors.push(DOMAIN_COLORS.affective.border);
        }
        if (domains.psychomotor?.count > 0) {
            labels.push('Psychomotor');
            counts.push(domains.psychomotor.count);
            backgroundColors.push(DOMAIN_COLORS.psychomotor.primary);
            borderColors.push(DOMAIN_COLORS.psychomotor.border);
        }
        if (domains.unclassified?.count > 0) {
            labels.push('Unclassified');
            counts.push(domains.unclassified.count);
            backgroundColors.push(DOMAIN_COLORS.unclassified.primary);
            borderColors.push(DOMAIN_COLORS.unclassified.border);
        }

        return {
            labels,
            datasets: [{
                data: counts,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 2,
                hoverOffset: 6
            }]
        };
    };

    const domainChartData = preparePieChartData();

    // Subdomain bar chart data preparations
    const cognitiveSubdomains = domains.cognitive?.subdomains || {};
    const cognitiveData = {
        labels: Object.keys(cognitiveSubdomains).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
        datasets: [{
            label: 'Cognitive Occurrences',
            data: Object.values(cognitiveSubdomains),
            backgroundColor: 'rgba(124, 58, 237, 0.75)',
            borderColor: '#A855F7',
            borderWidth: 1.5,
            borderRadius: 6
        }]
    };

    const affectiveSubdomains = domains.affective?.subdomains || {};
    const affectiveData = {
        labels: Object.keys(affectiveSubdomains).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
        datasets: [{
            label: 'Affective Occurrences',
            data: Object.values(affectiveSubdomains),
            backgroundColor: 'rgba(236, 72, 153, 0.75)',
            borderColor: '#F472B6',
            borderWidth: 1.5,
            borderRadius: 6
        }]
    };

    const psychomotorSubdomains = domains.psychomotor?.subdomains || {};
    const psychomotorData = {
        labels: Object.keys(psychomotorSubdomains).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
        datasets: [{
            label: 'Psychomotor Occurrences',
            data: Object.values(psychomotorSubdomains),
            backgroundColor: 'rgba(34, 211, 238, 0.75)',
            borderColor: '#38BDF8',
            borderWidth: 1.5,
            borderRadius: 6
        }]
    };

    // Dark theme chart options
    const darkChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#CBD5E1',
                    font: { family: 'Inter', size: 12 },
                    padding: 16
                }
            },
            tooltip: {
                backgroundColor: 'rgba(10, 15, 31, 0.95)',
                titleColor: '#FFFFFF',
                bodyColor: '#CBD5E1',
                borderColor: 'rgba(124, 58, 237, 0.4)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((acc, d) => acc + d, 0);
                        const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                        return ` ${label}: ${value} (${percentage}%)`;
                    }
                }
            },
            datalabels: {
                formatter: (value, ctx) => {
                    const total = ctx.dataset.data.reduce((acc, d) => acc + d, 0);
                    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                    return percentage > 5 ? `${percentage}%` : '';
                },
                color: '#FFFFFF',
                font: { weight: 'bold', size: 12 }
            }
        }
    };

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                ticks: { color: '#94A3B8', font: { family: 'Inter', size: 11 } },
                grid: { color: 'rgba(255, 255, 255, 0.04)' }
            },
            y: {
                beginAtZero: true,
                ticks: { color: '#94A3B8', font: { family: 'Inter', size: 11 } },
                grid: { color: 'rgba(255, 255, 255, 0.06)' }
            }
        },
        plugins: {
            legend: { display: false },
            datalabels: { display: false },
            tooltip: {
                backgroundColor: 'rgba(10, 15, 31, 0.95)',
                titleColor: '#FFFFFF',
                bodyColor: '#CBD5E1',
                borderColor: 'rgba(124, 58, 237, 0.4)',
                borderWidth: 1,
                padding: 10
            }
        }
    };

    return (
        <div className="evalix-dashboard-page charts-view-page">
            {exportError && (
                <div className="evalix-alert-banner alert-error mb-3" style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '10px', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#FCA5A5' }}>
                    <span>{exportError}</span>
                    <button onClick={() => setExportError(null)} style={{ background: 'none', border: 'none', color: '#FCA5A5', cursor: 'pointer', fontSize: '1.2rem', lineHeight: '1' }}>×</button>
                </div>
            )}
            {/* Top Meta Card */}
            <div className="document-overview-card glass-panel mb-4">
                <div className="overview-header">
                    <div className="overview-title-group">
                        <div className="doc-icon-badge">
                            <FiFileText />
                        </div>
                        <div>
                            <span className="doc-badge-pill">Analyzed Document</span>
                            <h2 className="doc-filename-heading">{documentInfo?.filename || 'Uploaded Document'}</h2>
                        </div>
                    </div>
                    <div className="overview-actions">
                        <button 
                            className="btn-evalix-secondary"
                            onClick={() => navigate('/classifications')}
                        >
                            <FiList className="me-2" />
                            View Verb Table
                        </button>
                        <button 
                            className="btn-evalix-primary"
                            onClick={handleExportExcel}
                            disabled={isExporting}
                            title="Download comprehensive multi-sheet Excel report"
                        >
                            {isExporting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <FiDownload className="me-2" />
                                    Export Excel
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="metrics-grid">
                    <div className="metric-box">
                        <span className="metric-label">Total Verbs</span>
                        <span className="metric-value gradient-text">{totalVerbCount || 0}</span>
                    </div>
                    <div className="metric-box">
                        <span className="metric-label">Unique Verbs</span>
                        <span className="metric-value gradient-text-cyan">{uniqueVerbCount || 0}</span>
                    </div>
                    <div className="metric-box">
                        <span className="metric-label">Cognitive Share</span>
                        <span className="metric-value" style={{ color: '#A855F7' }}>
                            {totalVerbCount > 0 ? Math.round(((domains.cognitive?.count || 0) / totalVerbCount) * 100) : 0}%
                        </span>
                    </div>
                    <div className="metric-box">
                        <span className="metric-label">Affective Share</span>
                        <span className="metric-value" style={{ color: '#EC4899' }}>
                            {totalVerbCount > 0 ? Math.round(((domains.affective?.count || 0) / totalVerbCount) * 100) : 0}%
                        </span>
                    </div>
                    <div className="metric-box">
                        <span className="metric-label">Psychomotor Share</span>
                        <span className="metric-value" style={{ color: '#22D3EE' }}>
                            {totalVerbCount > 0 ? Math.round(((domains.psychomotor?.count || 0) / totalVerbCount) * 100) : 0}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Visual Charts Grid */}
            <div className="charts-main-grid">
                {/* Domain Distribution Chart */}
                <div className="chart-card glass-panel">
                    <div className="chart-card-header">
                        <div>
                            <h3 className="chart-card-title">Bloom's Domain Distribution</h3>
                            <p className="chart-card-sub">Relative proportion across educational domains</p>
                        </div>
                        <div className="chart-type-toggle">
                            <button 
                                className={`toggle-pill ${chartMode === 'doughnut' ? 'active' : ''}`}
                                onClick={() => setChartMode('doughnut')}
                            >
                                Doughnut
                            </button>
                            <button 
                                className={`toggle-pill ${chartMode === 'pie' ? 'active' : ''}`}
                                onClick={() => setChartMode('pie')}
                            >
                                Pie
                            </button>
                        </div>
                    </div>
                    <div className="chart-canvas-wrapper doughnut-chart-wrapper">
                        {chartMode === 'doughnut' ? (
                            <Doughnut data={domainChartData} options={darkChartOptions} />
                        ) : (
                            <Pie data={domainChartData} options={darkChartOptions} />
                        )}
                    </div>
                </div>

                {/* Top Frequent Action Verbs */}
                <div className="frequent-verbs-card glass-panel">
                    <div className="chart-card-header">
                        <div>
                            <h3 className="chart-card-title">Frequent Action Verbs</h3>
                            <p className="chart-card-sub">Top classified verbs detected in paper</p>
                        </div>
                        <button 
                            className="view-all-link-btn"
                            onClick={() => navigate('/classifications')}
                        >
                            All ({uniqueVerbCount || 0}) →
                        </button>
                    </div>

                    <div className="frequent-verbs-list">
                        {verbsByFrequency && verbsByFrequency.length > 0 ? (
                            verbsByFrequency.slice(0, 8).map((verbItem, idx) => {
                                const domain = verbItem.classification?.domain?.toLowerCase() || 'unclassified';
                                const domainColor = DOMAIN_COLORS[domain]?.primary || '#64748B';

                                return (
                                    <div key={idx} className="frequent-verb-row">
                                        <div className="verb-info">
                                            <span className="verb-rank">#{idx + 1}</span>
                                            <span className="verb-word">{verbItem.verb}</span>
                                            <span 
                                                className="domain-pill-tag"
                                                style={{ 
                                                    borderColor: domainColor, 
                                                    color: domainColor,
                                                    background: `${domainColor}15`
                                                }}
                                            >
                                                {domain}
                                            </span>
                                        </div>
                                        <div className="verb-metric-right">
                                            <span className="freq-badge">{verbItem.frequency}x</span>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="no-data-text py-4 text-center">No action verbs detected.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Subdomain Breakdown Section (3 Columns) */}
            <div className="subdomains-grid mt-4">
                {/* Cognitive Subdomains */}
                <div className="subdomain-card glass-panel border-purple">
                    <div className="subdomain-card-header">
                        <div className="domain-indicator-dot dot-cognitive"></div>
                        <h4 className="subdomain-card-title">Cognitive Subdomains</h4>
                    </div>
                    <div className="chart-canvas-wrapper bar-chart-wrapper">
                        <Bar data={cognitiveData} options={barChartOptions} />
                    </div>
                </div>

                {/* Affective Subdomains */}
                <div className="subdomain-card glass-panel border-magenta">
                    <div className="subdomain-card-header">
                        <div className="domain-indicator-dot dot-affective"></div>
                        <h4 className="subdomain-card-title">Affective Subdomains</h4>
                    </div>
                    <div className="chart-canvas-wrapper bar-chart-wrapper">
                        <Bar data={affectiveData} options={barChartOptions} />
                    </div>
                </div>

                {/* Psychomotor Subdomains */}
                <div className="subdomain-card glass-panel border-cyan">
                    <div className="subdomain-card-header">
                        <div className="domain-indicator-dot dot-psychomotor"></div>
                        <h4 className="subdomain-card-title">Psychomotor Subdomains</h4>
                    </div>
                    <div className="chart-canvas-wrapper bar-chart-wrapper">
                        <Bar data={psychomotorData} options={barChartOptions} />
                    </div>
                </div>
            </div>

            {/* Bottom Actions Banner */}
            <div className="charts-footer-banner glass-panel mt-4">
                <div>
                    <h4 className="banner-title">Need Pedagogical Recommendations?</h4>
                    <p className="banner-sub">Evalix generates automated gap analyses and curriculum guidance based on these distributions.</p>
                </div>
                <div className="banner-buttons">
                    <button 
                        className="btn-evalix-secondary"
                        onClick={() => navigate('/recommendations')}
                    >
                        View Recommendations
                    </button>
                    <button 
                        className="btn-evalix-primary"
                        onClick={() => navigate('/about')}
                    >
                        Learn About Analysis →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnalysisDashboard;
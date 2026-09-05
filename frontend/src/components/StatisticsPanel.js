// components/StatisticsPanel.js
import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';
import { FiBarChart2, FiBook, FiHeart, FiActivity, FiAlertCircle } from 'react-icons/fi';
import '../styles/StatisticsPanel.scss';

const StatisticsPanel = ({ data }) => {
    const totalVerbs = data.totalVerbCount;

    const domainCounts = {
        cognitive: data.domains.cognitive.count,
        affective: data.domains.affective.count,
        psychomotor: data.domains.psychomotor.count,
        unclassified: data.domains.unclassified.count
    };

    // Find top subdomains
    const getTopSubdomain = (domain) => {
        if (domain === 'unclassified') return null;

        const subdomains = Object.entries(data.domains[domain].subdomains);
        if (subdomains.length === 0) return null;

        return subdomains.reduce((top, current) =>
            current[1] > top[1] ? current : top
        );
    };

    const getDomainIcon = (domain) => {
        switch (domain) {
            case 'cognitive': return <FiBook className="stat-icon cognitive" />;
            case 'affective': return <FiHeart className="stat-icon affective" />;
            case 'psychomotor': return <FiActivity className="stat-icon psychomotor" />;
            default: return <FiAlertCircle className="stat-icon unclassified" />;
        }
    };

    return (
        <Card className="statistics-panel">
            <Card.Header>
                <div className="d-flex align-items-center">
                    <FiBarChart2 className="mr-2" />
                    <h5 className="mb-0 ml-2">Analysis Statistics</h5>
                </div>
            </Card.Header>
            <Card.Body className="p-0">
                <div className="main-stat">
                    <div className="stat-value">{totalVerbs}</div>
                    <div className="stat-label">Total Verbs Analyzed</div>
                </div>

                <ListGroup variant="flush">
                    {Object.entries(domainCounts).map(([domain, count]) => {
                        const topSubdomain = getTopSubdomain(domain);

                        return (
                            <ListGroup.Item key={domain} className="domain-stat">
                                <div className="d-flex align-items-center">
                                    {getDomainIcon(domain)}
                                    <div className="domain-stat-content">
                                        <div className="domain-name">
                                            {domain.charAt(0).toUpperCase() + domain.slice(1)}
                                            <span className="domain-count">{count}</span>
                                        </div>

                                        {topSubdomain && (
                                            <div className="top-subdomain">
                                                Top: <span className="subdomain-name">
                                                    {topSubdomain[0].charAt(0).toUpperCase() + topSubdomain[0].slice(1)}
                                                </span>
                                                <span className="subdomain-count">({topSubdomain[1]})</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="percentage-bar">
                                    <div
                                        className={`percentage-fill ${domain}`}
                                        style={{ width: `${Math.round((count / totalVerbs) * 100)}%` }}
                                    ></div>
                                </div>
                            </ListGroup.Item>
                        );
                    })}
                </ListGroup>
            </Card.Body>
        </Card>
    );
};

export default StatisticsPanel;
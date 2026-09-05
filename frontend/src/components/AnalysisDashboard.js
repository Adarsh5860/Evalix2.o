// components/AnalysisDashboard.js
import React, { useState } from 'react';
import { Container, Row, Col, Nav, Tab, Card, Badge } from 'react-bootstrap';
import { Bar, Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
    FiPieChart, FiList,
    FiBriefcase, FiFileText
} from 'react-icons/fi';
import RecommendationsDashboard from './RecommendationsDashboard';
import DataTable from './DataTable';
import ReportsList from './ReportsList';

// Required for Chart.js 3.x
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
const AnalysisDashboard = ({ data }) => {
    const [activeTab, setActiveTab] = useState('overview');

    if (!data) {
        return (
            <Card className="shadow-sm">
                <Card.Body className="text-center py-5">
                    <h4>No Analysis Data Available</h4>
                    <p className="text-muted">Please upload and analyze a document first.</p>
                </Card.Body>
            </Card>
        );
    }

    // Chart colors
    const colors = {
        cognitive: {
            primary: 'rgba(13, 110, 253, 0.8)',
            hover: 'rgba(13, 110, 253, 1)',
            border: 'rgba(13, 110, 253, 1)'
        },
        affective: {
            primary: 'rgba(220, 53, 69, 0.8)',
            hover: 'rgba(220, 53, 69, 1)',
            border: 'rgba(220, 53, 69, 1)'
        },
        psychomotor: {
            primary: 'rgba(25, 135, 84, 0.8)',
            hover: 'rgba(25, 135, 84, 1)',
            border: 'rgba(25, 135, 84, 1)'
        },
        unclassified: {
            primary: 'rgba(108, 117, 125, 0.8)',
            hover: 'rgba(108, 117, 125, 1)',
            border: 'rgba(108, 117, 125, 1)'
        }
    };

    // Prepare data for domain distribution pie chart
    // const domainDistributionData = {
    //     labels: ['Cognitive', 'Affective', 'Psychomotor', 'Unclassified'],
    //     datasets: [
    //         {
    //             data: [
    //                 data.domains.cognitive.count,
    //                 data.domains.affective.count,
    //                 data.domains.psychomotor.count,
    //                 data.domains.unclassified.count
    //             ],
    //             backgroundColor: [
    //                 colors.cognitive.primary,
    //                 colors.affective.primary,
    //                 colors.psychomotor.primary,
    //                 colors.unclassified.primary
    //             ],
    //             hoverBackgroundColor: [
    //                 colors.cognitive.hover,
    //                 colors.affective.hover,
    //                 colors.psychomotor.hover,
    //                 colors.unclassified.hover
    //             ],
    //             borderColor: [
    //                 colors.cognitive.border,
    //                 colors.affective.border,
    //                 colors.psychomotor.border,
    //                 colors.unclassified.border
    //             ],
    //             borderWidth: 1,
    //         },
    //     ],
    // };

    // In AnalysisDashboard.js - Replace the existing pie chart data preparation

    // Prepare filtered data for domain distribution pie chart
    const preparePieChartData = () => {
        // Initialize arrays for filtered data
        const labels = [];
        const counts = [];
        const backgroundColors = [];
        const hoverBackgroundColors = [];
        const borderColors = [];

        // Add domains only if they have non-zero counts
        if (data.domains.cognitive.count > 0) {
            labels.push('Cognitive');
            counts.push(data.domains.cognitive.count);
            backgroundColors.push(colors.cognitive.primary);
            hoverBackgroundColors.push(colors.cognitive.hover);
            borderColors.push(colors.cognitive.border);
        }

        if (data.domains.affective.count > 0) {
            labels.push('Affective');
            counts.push(data.domains.affective.count);
            backgroundColors.push(colors.affective.primary);
            hoverBackgroundColors.push(colors.affective.hover);
            borderColors.push(colors.affective.border);
        }

        if (data.domains.psychomotor.count > 0) {
            labels.push('Psychomotor');
            counts.push(data.domains.psychomotor.count);
            backgroundColors.push(colors.psychomotor.primary);
            hoverBackgroundColors.push(colors.psychomotor.hover);
            borderColors.push(colors.psychomotor.border);
        }

        if (data.domains.unclassified.count > 0) {
            labels.push('Unclassified');
            counts.push(data.domains.unclassified.count);
            backgroundColors.push(colors.unclassified.primary);
            hoverBackgroundColors.push(colors.unclassified.hover);
            borderColors.push(colors.unclassified.border);
        }

        return {
            labels: labels,
            datasets: [{
                data: counts,
                backgroundColor: backgroundColors,
                hoverBackgroundColor: hoverBackgroundColors,
                borderColor: borderColors,
                borderWidth: 1,
            }]
        };
    };

    // Create chart data using the function
    const domainDistributionData = preparePieChartData();
    
    // Prepare data for cognitive subdomains
    const cognitiveSubdomains = data.domains.cognitive.subdomains; 
    const cognitiveData = {
        labels: Object.keys(cognitiveSubdomains).map(
            key => key.charAt(0).toUpperCase() + key.slice(1)
        ),
        datasets: [
            {
                label: 'Cognitive Subdomains',
                data: Object.values(cognitiveSubdomains),
                backgroundColor: 'rgba(13, 110, 253, 0.8)',
                borderColor: 'rgba(13, 110, 253, 1)',
                borderWidth: 1,
            },
        ],
    };

    // Prepare data for affective subdomains
    const affectiveSubdomains = data.domains.affective.subdomains;
    const affectiveData = {
        labels: Object.keys(affectiveSubdomains).map(
            key => key.charAt(0).toUpperCase() + key.slice(1)
        ),
        datasets: [
            {
                label: 'Affective Subdomains',
                data: Object.values(affectiveSubdomains),
                backgroundColor: 'rgba(220, 53, 69, 0.8)',
                borderColor: 'rgba(220, 53, 69, 1)',
                borderWidth: 1,
            },
        ],
    };

    // Prepare data for psychomotor subdomains
    const psychomotorSubdomains = data.domains.psychomotor.subdomains;
    const psychomotorData = {
        labels: Object.keys(psychomotorSubdomains).map(
            key => key.charAt(0).toUpperCase() + key.slice(1)
        ),
        datasets: [
            {
                label: 'Psychomotor Subdomains',
                data: Object.values(psychomotorSubdomains),
                backgroundColor: 'rgba(25, 135, 84, 0.8)',
                borderColor: 'rgba(25, 135, 84, 1)',
                borderWidth: 1,
            },
        ],
    };


    // Chart options with percentages
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
                        const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        }
    };


    // Then update the pie chart options
    const pieChartOptions = {
        ...chartOptions,
        plugins: {
            ...chartOptions.plugins,
            datalabels: {
                formatter: (value, ctx) => {
                    const total = ctx.dataset.data.reduce((acc, data) => acc + data, 0);
                    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                    return percentage > 5 ? `${percentage}%` : ''; // Only show if percentage is significant
                },
                color: '#fff',
                font: {
                    weight: 'bold',
                    size: 12
                }
            }
        }
    };

    // Then use pieChartOptions for your pie chart
    <Pie data={domainDistributionData} options={pieChartOptions} />

    // Bar chart options
    const barOptions = {
        ...chartOptions,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    return (
        <Container fluid className="p-0">
            <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                <Row className="mb-4">
                    <Col>
                        <Nav variant="tabs" className="nav-fill">
                            <Nav.Item>
                                <Nav.Link eventKey="overview" className="d-flex align-items-center">
                                    <FiPieChart className="me-2" />
                                    Overview
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="recommendations" className="d-flex align-items-center">
                                    <FiBriefcase className="me-2" />
                                    Recommendations
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="verbTable" className="d-flex align-items-center">
                                    <FiList className="me-2" />
                                    Verb Table
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="reports" className="d-flex align-items-center">
                                    <FiFileText className="me-2" />
                                    Reports
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Col>
                </Row>

                <Tab.Content>
                    <Tab.Pane eventKey="overview">
                        <Row className="mb-4">
                            <Col lg={8}>
                                <Card className="shadow-sm mb-4">
                                    <Card.Header className="bg-white">
                                        <h5 className="mb-0">Document Information</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col md={6}>
                                                <p className="mb-1">
                                                    <strong>Filename:</strong> {data.documentInfo.filename}
                                                </p>
                                                <p className="mb-1">
                                                    <strong>Text Length:</strong> {data.documentInfo.textLength.toLocaleString()} characters
                                                </p>
                                            </Col>
                                            <Col md={6}>
                                                <p className="mb-1">
                                                    <strong>Analyzed On:</strong> {new Date(data.documentInfo.analyzedAt).toLocaleString()}
                                                </p>
                                                <p className="mb-1">
                                                    <strong>File Size:</strong> {Math.round(data.documentInfo.filesize / 1024).toLocaleString()} KB
                                                </p>
                                            </Col>
                                        </Row>
                                        <div className="mt-3 d-flex">
                                            <div className="me-4">
                                                <Badge bg="primary" className="fs-6 me-2">{data.totalVerbCount}</Badge>
                                                <span>Total Verb Occurrences</span>
                                            </div>
                                            <div>
                                                <Badge bg="info" className="fs-6 me-2">{data.uniqueVerbCount}</Badge>
                                                <span>Unique Verbs</span>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                                <Card className="shadow-sm">
                                    <Card.Header className="bg-white">
                                        <h5 className="mb-0">Domain Distribution</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <div style={{ height: '300px' }}>
                                            <Pie data={domainDistributionData} options={chartOptions} />
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col lg={4}>
                                <Card className="shadow-sm h-100">
                                    <Card.Header className="bg-white">
                                        <h5 className="mb-0">Most Frequent Verbs</h5>
                                    </Card.Header>
                                    <Card.Body className="p-0">
                                        <div className="list-group list-group-flush">
                                            {data.verbsByFrequency?.slice(0, 10).map((verb, index) => (
                                                <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <strong>{verb.verb}</strong>
                                                        <Badge
                                                            bg={
                                                                verb.classification.domain === 'cognitive' ? 'primary' :
                                                                    verb.classification.domain === 'affective' ? 'danger' :
                                                                        verb.classification.domain === 'psychomotor' ? 'success' :
                                                                            'secondary'
                                                            }
                                                            className="ms-2"
                                                        >
                                                            {verb.classification.domain}
                                                        </Badge>
                                                    </div>
                                                    <Badge bg="info" pill>{verb.frequency}</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={4}>
                                <Card className="shadow-sm mb-4">
                                    <Card.Header className="bg-primary text-white">
                                        <h5 className="mb-0">Cognitive Subdomains</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <div style={{ height: '250px' }}>
                                            <Bar data={cognitiveData} options={barOptions} />
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={4}>
                                <Card className="shadow-sm mb-4">
                                    <Card.Header className="bg-danger text-white">
                                        <h5 className="mb-0">Affective Subdomains</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <div style={{ height: '250px' }}>
                                            <Bar data={affectiveData} options={barOptions} />
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={4}>
                                <Card className="shadow-sm mb-4">
                                    <Card.Header className="bg-success text-white">
                                        <h5 className="mb-0">Psychomotor Subdomains</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <div style={{ height: '250px' }}>
                                            <Bar data={psychomotorData} options={barOptions} />
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Tab.Pane>

                    <Tab.Pane eventKey="recommendations">
                        <Row>
                            <Col>
                                <RecommendationsDashboard recommendations={data.recommendations} report={data.report} />
                            </Col>
                        </Row>
                    </Tab.Pane>

                    <Tab.Pane eventKey="verbTable">
                        <Row>
                            <Col>
                                <DataTable verbs={data.verbs} />
                            </Col>
                        </Row>
                    </Tab.Pane>

                    <Tab.Pane eventKey="reports">
                        <Row>
                            <Col>
                                <ReportsList currentReport={data.report} />
                            </Col>
                        </Row>
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </Container>
    );
};

export default AnalysisDashboard;
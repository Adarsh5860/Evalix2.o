// components/RecommendationsDashboard.js
import React from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import {
    FiBookOpen, FiHeart, FiActivity, FiDownload,
    FiCheckCircle, FiAlertCircle
} from 'react-icons/fi';

const RecommendationsDashboard = ({ recommendations, report }) => {
    if (!recommendations) {
        return (
            <Card className="shadow-sm mb-4">
                <Card.Body className="text-center py-5">
                    <FiAlertCircle size={40} className="text-muted mb-3" />
                    <h4>No Recommendations Available</h4>
                    <p className="text-muted">Upload and analyze a document to see recommendations.</p>
                </Card.Body>
            </Card>
        );
    }

    const renderDomainCard = (title, icon, content, color, borderColor) => (
        <Card className={`shadow-sm mb-4 border-${borderColor}`}>
            <Card.Header className={`bg-${color} text-white d-flex align-items-center`}>
                {icon}
                <h5 className="mb-0 ms-2">{title}</h5>
            </Card.Header>
            <Card.Body>
                <p>{content}</p>
            </Card.Body>
        </Card>
    );

    return (
        <>
            <Card className="shadow mb-4 border-primary">
                <Card.Header className="bg-primary bg-gradient text-white">
                    <h4 className="mb-0">Educational Focus Assessment</h4>
                </Card.Header>
                <Card.Body>
                    <p className="lead">{recommendations.main}</p>
                    {report && (
                        <div className="text-end mt-3">
                            <Button
                                variant="outline-primary"
                                href={report.url}
                                className="d-inline-flex align-items-center"
                            >
                                <FiDownload className="me-2" />
                                Download Full Excel Report
                            </Button>
                            
                        </div>
                    )}
                </Card.Body>
            </Card>

            <Row>
                <Col lg={4}>
                    {renderDomainCard(
                        "Cognitive Domain",
                        <FiBookOpen size={20} />,
                        recommendations.cognitive,
                        "primary",
                        "primary"
                    )}
                </Col>
                <Col lg={4}>
                    {renderDomainCard(
                        "Affective Domain",
                        <FiHeart size={20} />,
                        recommendations.affective,
                        "danger",
                        "danger"
                    )}
                </Col>
                <Col lg={4}>
                    {renderDomainCard(
                        "Psychomotor Domain",
                        <FiActivity size={20} />,
                        recommendations.psychomotor,
                        "success",
                        "success"
                    )}
                </Col>
            </Row>

            <Card className="shadow-sm mt-3">
                <Card.Header className="bg-light">
                    <h5 className="mb-0">Implementation Strategies</h5>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={4} className="mb-3">
                            <h6 className="d-flex align-items-center text-primary">
                                <FiCheckCircle className="me-2" /> For Cognitive Improvement
                            </h6>
                            <ul className="small">
                                <li>Balance lower and higher order thinking activities</li>
                                <li>Use more analysis and evaluation verbs</li>
                                <li>Create progressive cognitive development paths</li>
                                <li>Include synthesis activities alongside recall tasks</li>
                            </ul>
                        </Col>
                        <Col md={4} className="mb-3">
                            <h6 className="d-flex align-items-center text-danger">
                                <FiCheckCircle className="me-2" /> For Affective Improvement
                            </h6>
                            <ul className="small">
                                <li>Incorporate more emotional engagement</li>
                                <li>Include activities that develop values</li>
                                <li>Balance reception with internalization</li>
                                <li>Address motivational aspects of learning</li>
                            </ul>
                        </Col>
                        <Col md={4} className="mb-3">
                            <h6 className="d-flex align-items-center text-success">
                                <FiCheckCircle className="me-2" /> For Psychomotor Improvement
                            </h6>
                            <ul className="small">
                                <li>Increase action-oriented learning tasks</li>
                                <li>Create physical skill progression ladders</li>
                                <li>Balance theory with hands-on activities</li>
                                <li>Include guided practice opportunities</li>
                            </ul>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </>
    );
};

export default RecommendationsDashboard;
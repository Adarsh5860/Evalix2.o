// components/ReportsList.js - Updated version
import React, { useState } from 'react';
import { Card, Button, Spinner, ListGroup } from 'react-bootstrap';
import { FiDownload, FiFile, FiDatabase, FiAlertCircle } from 'react-icons/fi';

const ReportsList = ({ currentReport }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Format file size in KB or MB

    // Format date from ISO string to readable format
    const formatDate = (isoString) => {
        if (!isoString) return 'Unknown date';
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Handle file download to force download instead of navigation
    const handleDownload = async (url, filename) => {
        try {
            setLoading(true);

            // Use fetch to get the file as a blob
            const response = await fetch(url);
            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();

            // Create an object URL for the blob
            const objectUrl = URL.createObjectURL(blob);

            // Create a download link and trigger click
            const downloadLink = document.createElement('a');
            downloadLink.href = objectUrl;
            downloadLink.download = filename || 'report.xlsx';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

            // Clean up the URL object
            URL.revokeObjectURL(objectUrl);

        } catch (err) {
            setError(`Failed to download: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Card className="shadow-sm mb-4">
                <Card.Body className="text-center py-4">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted">Processing download...</p>
                </Card.Body>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="shadow-sm border-danger mb-4">
                <Card.Body className="text-center py-4">
                    <FiAlertCircle size={32} className="text-danger mb-2" />
                    <h5 className="text-danger">Error</h5>
                    <p>{error}</p>
                    <Button variant="outline-primary" onClick={() => setError(null)}>Dismiss</Button>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card className="shadow-sm">
            <Card.Header className="bg-white">
                <h5 className="mb-0">Available Reports</h5>
            </Card.Header>
            <ListGroup variant="flush">
                {/* Current Analysis Report */}
                {currentReport ? (
                    <ListGroup.Item>
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                                <FiFile size={20} className="text-primary me-3" />
                                <div>
                                    <div className="fw-bold">Current Analysis Report</div>
                                    <small className="text-muted">
                                        Generated on {formatDate(currentReport.created || new Date().toISOString())}
                                    </small>
                                </div>
                            </div>
                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleDownload(currentReport.url, "verb_analysis_report.xlsx")}
                                className="d-flex align-items-center"
                                disabled={loading}
                            >
                                <FiDownload className="me-1" />
                                Download
                            </Button>
                        </div>
                    </ListGroup.Item>
                ) : (
                    <ListGroup.Item className="text-muted text-center py-4">
                        No current report available
                    </ListGroup.Item>
                )}

                {/* Master Analysis History Report */}
                <ListGroup.Item>
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <FiDatabase size={20} className="text-success me-3" />
                            <div>
                                <div className="fw-bold">Analysis History Report</div>
                                <small className="text-muted">
                                    Complete history of all document analyses
                                </small>
                            </div>
                        </div>
                        <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleDownload("/api/papers/master-report", "verb_taxonomy_history.xlsx")}
                            className="d-flex align-items-center"
                            disabled={loading}
                        >
                            <FiDownload className="me-1" />
                            Download
                        </Button>
                    </div>
                </ListGroup.Item>
            </ListGroup>
        </Card>
    );
};

export default ReportsList;
// components/FileUploadPanel.js
import React, { useState } from 'react';
import { Card, Form, Button, Alert, ProgressBar } from 'react-bootstrap';
import { FiUpload, FiFile, FiCheckCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const FileUploadPanel = ({ onAnalysisComplete }) => {
    // Add this line to properly define loading state
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState(0);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            setError('Please select a file to upload');
            return;
        }

        // Check file type
        const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        if (!allowedTypes.includes(file.type)) {
            setError('Please upload a PDF, DOCX, or TXT file');
            return;
        }

        // Reset states
        setError(null);
        setLoading(true);
        setProgress(0);

        // Create form data
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Simulate progress for better UX
            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    const newProgress = prev + 5;
                    return newProgress >= 90 ? 90 : newProgress;
                });
            }, 500);

            // Send to server
            const response = await fetch('/api/papers/analyze', {
                method: 'POST',
                body: formData,
            });

            clearInterval(progressInterval);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error analyzing document');
            }

            setProgress(100);
            setUploadSuccess(true);

            // Get results
            const data = await response.json();

            // Pass data to parent component
            if (onAnalysisComplete) {
                onAnalysisComplete(data.data);
            }

            // Navigate to analysis page after a brief delay
            setTimeout(() => {
                navigate('/analysis');
            }, 1000);

        } catch (err) {
            setError(err.message || 'Error uploading file');
            setProgress(0);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="shadow-sm">
            <Card.Header className="bg-white">
                <h4 className="mb-0">Upload Document for Analysis</h4>
            </Card.Header>
            <Card.Body>
                {error && (
                    <Alert variant="danger" dismissible onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {uploadSuccess && (
                    <Alert variant="success" dismissible onClose={() => setUploadSuccess(false)}>
                        <FiCheckCircle className="me-2" />
                        Document analyzed successfully!
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                    <div className="mb-4 text-center py-4 border rounded bg-light">
                        <FiUpload size={40} className="text-primary mb-3" />
                        <h5>Drag & Drop Document Here</h5>
                        <p className="text-muted mb-4">Supports PDF, DOCX and TXT files</p>

                        <div className="d-flex justify-content-center">
                            <Form.Group controlId="formFile" className="mb-0 w-50">
                                <Form.Control
                                    type="file"
                                    accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                                    onChange={handleFileChange}
                                    disabled={loading}
                                />
                            </Form.Group>
                        </div>
                    </div>

                    {file && (
                        <div className="mb-3 d-flex align-items-center">
                            <FiFile className="text-primary me-2" />
                            <div className="text-truncate">{file.name}</div>
                            <small className="ms-2 text-muted">({(file.size / 1024).toFixed(1)} KB)</small>
                        </div>
                    )}

                    {loading && (
                        <ProgressBar
                            animated
                            now={progress}
                            label={`${progress}%`}
                            className="mb-3"
                            variant={progress < 100 ? "primary" : "success"}
                        />
                    )}

                    <div className="d-grid gap-2">
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={loading || !file}
                            className="d-flex align-items-center justify-content-center"
                        >
                            {loading ? (
                                <>Processing...</>
                            ) : (
                                <>
                                    <FiUpload className="me-2" />
                                    Analyze Document
                                </>
                            )}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
            <Card.Footer className="bg-white">
                <small className="text-muted">
                    Supported file types: PDF, DOCX, TXT. Maximum file size: 10MB.
                </small>
            </Card.Footer>
        </Card>
    );
};

export default FileUploadPanel;
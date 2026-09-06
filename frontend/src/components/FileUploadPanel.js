// components/FileUploadPanel.js
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FiUploadCloud, 
    FiFileText, 
    FiCheck, 
    FiAlertCircle, 
    FiX, 
    FiArrowRight
} from 'react-icons/fi';
import ResearchPaperVisual from './ResearchPaperVisual';
import { analyzePaper } from '../services/api';
import '../styles/FileUploadPanel.scss';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB limit
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt'];

const LOADING_STEPS = [
    { id: 1, label: 'Extracting text from document' },
    { id: 2, label: 'Detecting action verbs via NLP' },
    { id: 3, label: 'Classifying Bloom\'s Taxonomy domains' },
    { id: 4, label: 'Generating insights & recommendations' }
];

const FileUploadPanel = ({ onAnalysisComplete }) => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef(null);
    const dragCounter = useRef(0);
    const navigate = useNavigate();

    // File validation
    const validateFile = (selectedFile) => {
        if (!selectedFile) return false;

        const filename = selectedFile.name.toLowerCase();
        const hasValidExt = ALLOWED_EXTENSIONS.some(ext => filename.endsWith(ext));

        if (!hasValidExt) {
            setError('Unsupported file type. Please upload PDF, DOCX, or TXT.');
            return false;
        }

        if (selectedFile.size > MAX_FILE_SIZE) {
            setError('File size exceeds the 10 MB limit.');
            return false;
        }

        return true;
    };

    // Native file input change
    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (validateFile(selectedFile)) {
                setFile(selectedFile);
                setError(null);
            } else {
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        }
    };

    // Trigger file picker
    const handleChooseFileClick = () => {
        if (!loading && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Remove selected file
    const handleRemoveFile = (e) => {
        e.stopPropagation();
        setFile(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Drag and Drop handlers
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current++;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragOver(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current--;
        if (dragCounter.current === 0) {
            setIsDragOver(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        dragCounter.current = 0;

        if (loading) return;

        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles && droppedFiles.length > 0) {
            const droppedFile = droppedFiles[0];
            if (validateFile(droppedFile)) {
                setFile(droppedFile);
                setError(null);
            } else {
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        }
    };

    // Submit and Analyze Document
    const handleAnalyze = async () => {
        if (!file || loading) return;

        setLoading(true);
        setError(null);
        setCurrentStep(1);

        const formData = new FormData();
        formData.append('file', file);

        // Advance visual loading steps smoothly
        const stepTimer1 = setTimeout(() => setCurrentStep(2), 1200);
        const stepTimer2 = setTimeout(() => setCurrentStep(3), 2800);
        const stepTimer3 = setTimeout(() => setCurrentStep(4), 4500);

        try {
            const responseData = await analyzePaper(formData);

            clearTimeout(stepTimer1);
            clearTimeout(stepTimer2);
            clearTimeout(stepTimer3);

            if (responseData && (responseData.data || responseData.domains)) {
                const analysisResult = responseData.data || responseData;

                if (onAnalysisComplete) {
                    onAnalysisComplete(analysisResult);
                }

                // Short delay to display completion before navigation
                setTimeout(() => {
                    navigate('/charts');
                }, 700);
            } else {
                throw new Error('Analysis completed but returned empty results.');
            }
        } catch (err) {
            clearTimeout(stepTimer1);
            clearTimeout(stepTimer2);
            clearTimeout(stepTimer3);
            console.error('Analysis failed:', err);

            let message = 'Analysis failed. Please try again.';
            if (err.response?.data?.error) {
                message = err.response.data.error;
            } else if (err.message) {
                if (err.message.includes('Network Error') || err.message.includes('ECONNREFUSED')) {
                    message = 'Analysis server is unavailable. Please make sure the backend server is running on port 5001.';
                } else {
                    message = err.message;
                }
            }
            setError(message);
            setLoading(false);
        }
    };

    return (
        <div className="evalix-dashboard-page">
            <div className="dashboard-grid-layout">
                {/* Left Column: Upload Document Section */}
                <div className="upload-column">
                    {/* Header badge & title */}
                    <div className="page-header-block">
                        <div className="header-badge">
                            <span className="badge-sparkle">✦</span>
                            <span>AI-Powered Educational Analysis</span>
                        </div>
                        <h1 className="header-title">
                            Upload Document <span className="gradient-text">for Analysis</span>
                        </h1>
                        <p className="header-subtitle">
                            Upload your research paper, syllabus or educational document to analyze action verbs using Bloom's Taxonomy.
                        </p>
                    </div>

                    {/* Error message alert */}
                    {error && (
                        <div className="evalix-alert-banner alert-error animate-fade-in">
                            <FiAlertCircle className="alert-icon" />
                            <div className="alert-message">{error}</div>
                            <button className="alert-close-btn" onClick={() => setError(null)} title="Dismiss">
                                <FiX />
                            </button>
                        </div>
                    )}

                    {/* Upload Card */}
                    <div 
                        className={`evalix-upload-card glass-panel ${isDragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.docx,.txt"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            disabled={loading}
                        />

                        <div className="upload-inner-dropzone">
                            <div className="upload-icon-glow-ring">
                                <FiUploadCloud className="upload-main-icon" />
                            </div>

                            <h3 className="dropzone-title">Drag & Drop Your Document Here</h3>
                            <p className="dropzone-sub">Supports PDF, DOCX and TXT files</p>

                            <button 
                                type="button" 
                                className="choose-file-btn"
                                onClick={handleChooseFileClick}
                                disabled={loading}
                            >
                                <FiFileText className="btn-icon" />
                                <span>Choose File</span>
                            </button>

                            <div className="file-status-row">
                                {file ? (
                                    <div className="selected-file-chip animate-fade-in">
                                        <FiFileText className="chip-icon" />
                                        <span className="chip-name" title={file.name}>{file.name}</span>
                                        <span className="chip-size">({(file.size / 1024).toFixed(1)} KB)</span>
                                        {!loading && (
                                            <button 
                                                type="button" 
                                                className="chip-remove-btn"
                                                onClick={handleRemoveFile}
                                                title="Remove selected file"
                                            >
                                                <FiX />
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <span className="no-file-text">No file chosen</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Loading State Display */}
                    {loading && (
                        <div className="analysis-loading-card glass-panel animate-fade-in">
                            <div className="loading-header">
                                <span className="loading-sparkle">✦</span>
                                <span className="loading-title">Analyzing Document...</span>
                            </div>
                            <div className="loading-steps-list">
                                {LOADING_STEPS.map((step) => {
                                    const isDone = currentStep > step.id;
                                    const isCurrent = currentStep === step.id;

                                    return (
                                        <div 
                                            key={step.id} 
                                            className={`loading-step-item ${isDone ? 'step-done' : ''} ${isCurrent ? 'step-current' : ''}`}
                                        >
                                            <div className="step-indicator">
                                                {isDone ? (
                                                    <FiCheck className="step-check" />
                                                ) : (
                                                    <span className="step-dot"></span>
                                                )}
                                            </div>
                                            <span className="step-label">{step.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="loading-progress-bar">
                                <div 
                                    className="loading-progress-fill" 
                                    style={{ width: `${Math.min(currentStep * 25, 95)}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* Analyze Document Button */}
                    <div className="analyze-action-row">
                        <button
                            type="button"
                            className="btn-analyze-document"
                            onClick={handleAnalyze}
                            disabled={!file || loading}
                        >
                            {loading ? (
                                <>
                                    <span className="button-spinner"></span>
                                    <span>Processing Document...</span>
                                </>
                            ) : (
                                <>
                                    <span className="sparkle-icon">✦</span>
                                    <span>Analyze Document</span>
                                    <FiArrowRight className="arrow-icon" />
                                </>
                            )}
                        </button>
                    </div>

                    {/* Feature Badges */}
                    <div className="feature-badges-grid">
                        <div className="feature-pill-badge">
                            <div className="pill-check-icon"><FiCheck /></div>
                            <span>Bloom's Taxonomy Framework</span>
                        </div>
                        <div className="feature-pill-badge">
                            <div className="pill-check-icon"><FiCheck /></div>
                            <span>Vector Embedding Similarity</span>
                        </div>
                        <div className="feature-pill-badge">
                            <div className="pill-check-icon"><FiCheck /></div>
                            <span>Accurate Verb Classification</span>
                        </div>
                        <div className="feature-pill-badge">
                            <div className="pill-check-icon"><FiCheck /></div>
                            <span>Instant Insight Reports</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Research Paper Visualization & Stats */}
                <div className="visual-column">
                    <ResearchPaperVisual />
                </div>
            </div>
        </div>
    );
};

export default FileUploadPanel;
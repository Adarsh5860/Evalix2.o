// App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.scss';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import FileUploadPanel from './components/FileUploadPanel';
import AnalysisDashboard from './components/AnalysisDashboard';
import VerbClassificationsPage from './components/VerbClassificationsPage';
import RecommendationsDashboard from './components/RecommendationsDashboard';
import ReportsList from './components/ReportsList';
<<<<<<< HEAD
import LandingPage from './components/LandingPage';
// App.js - Update
function App() {
    const [analysisData, setAnalysisData] = useState(null);
=======
import AboutAnalysisPage from './components/AboutAnalysisPage';
>>>>>>> origin/main

// Default realistic sample data for demo / instant preview
const SAMPLE_ANALYSIS_DATA = {
    documentInfo: {
        filename: 'Sample_Research_Paper_Exp7.pdf',
        filesize: 518118,
        textLength: 14280,
        analyzedAt: new Date().toISOString()
    },
    totalVerbCount: 168,
    uniqueVerbCount: 52,
    domains: {
        cognitive: {
            count: 104,
            subdomains: {
                remember: 18,
                understand: 26,
                apply: 22,
                analyze: 19,
                evaluate: 11,
                create: 8
            }
        },
        affective: {
            count: 36,
            subdomains: {
                receiving: 8,
                responding: 12,
                valuing: 7,
                organizing: 5,
                characterizing: 4
            }
        },
        psychomotor: {
            count: 24,
            subdomains: {
                perception: 4,
                set: 3,
                guidedResponse: 5,
                mechanism: 6,
                complexResponse: 3,
                adaptation: 2,
                origination: 1
            }
        },
        unclassified: { count: 4, subdomains: { unknown: 4 } }
    },
    verbs: [
        { verb: 'analyze', frequency: 12, classification: { domain: 'cognitive', subdomain: 'analyze', confidence: 0.98, matchedWith: 'analyze' } },
        { verb: 'implement', frequency: 10, classification: { domain: 'cognitive', subdomain: 'apply', confidence: 0.96, matchedWith: 'implement' } },
        { verb: 'evaluate', frequency: 9, classification: { domain: 'cognitive', subdomain: 'evaluate', confidence: 0.97, matchedWith: 'evaluate' } },
        { verb: 'design', frequency: 8, classification: { domain: 'cognitive', subdomain: 'create', confidence: 0.95, matchedWith: 'design' } },
        { verb: 'explain', frequency: 8, classification: { domain: 'cognitive', subdomain: 'understand', confidence: 0.96, matchedWith: 'explain' } },
        { verb: 'compare', frequency: 7, classification: { domain: 'cognitive', subdomain: 'analyze', confidence: 0.94, matchedWith: 'compare' } },
        { verb: 'identify', frequency: 7, classification: { domain: 'cognitive', subdomain: 'remember', confidence: 0.95, matchedWith: 'identify' } },
        { verb: 'execute', frequency: 6, classification: { domain: 'psychomotor', subdomain: 'mechanism', confidence: 0.92, matchedWith: 'execute' } },
        { verb: 'participate', frequency: 6, classification: { domain: 'affective', subdomain: 'responding', confidence: 0.91, matchedWith: 'participate' } },
        { verb: 'demonstrate', frequency: 6, classification: { domain: 'cognitive', subdomain: 'apply', confidence: 0.94, matchedWith: 'demonstrate' } },
        { verb: 'appreciate', frequency: 5, classification: { domain: 'affective', subdomain: 'valuing', confidence: 0.93, matchedWith: 'appreciate' } },
        { verb: 'summarize', frequency: 5, classification: { domain: 'cognitive', subdomain: 'understand', confidence: 0.95, matchedWith: 'summarize' } },
        { verb: 'operate', frequency: 5, classification: { domain: 'psychomotor', subdomain: 'mechanism', confidence: 0.90, matchedWith: 'operate' } },
        { verb: 'prioritize', frequency: 4, classification: { domain: 'affective', subdomain: 'organizing', confidence: 0.92, matchedWith: 'prioritize' } },
        { verb: 'calibrate', frequency: 4, classification: { domain: 'psychomotor', subdomain: 'complexResponse', confidence: 0.89, matchedWith: 'calibrate' } },
        { verb: 'recall', frequency: 4, classification: { domain: 'cognitive', subdomain: 'remember', confidence: 0.97, matchedWith: 'recall' } },
        { verb: 'listen', frequency: 3, classification: { domain: 'affective', subdomain: 'receiving', confidence: 0.94, matchedWith: 'listen' } },
        { verb: 'adopt', frequency: 3, classification: { domain: 'affective', subdomain: 'characterizing', confidence: 0.88, matchedWith: 'adopt' } },
        { verb: 'construct', frequency: 3, classification: { domain: 'cognitive', subdomain: 'create', confidence: 0.93, matchedWith: 'construct' } },
        { verb: 'practice', frequency: 3, classification: { domain: 'psychomotor', subdomain: 'guidedResponse', confidence: 0.91, matchedWith: 'practice' } }
    ],
    verbsByFrequency: [
        { verb: 'analyze', frequency: 12, classification: { domain: 'cognitive', subdomain: 'analyze', confidence: 0.98 } },
        { verb: 'implement', frequency: 10, classification: { domain: 'cognitive', subdomain: 'apply', confidence: 0.96 } },
        { verb: 'evaluate', frequency: 9, classification: { domain: 'cognitive', subdomain: 'evaluate', confidence: 0.97 } },
        { verb: 'design', frequency: 8, classification: { domain: 'cognitive', subdomain: 'create', confidence: 0.95 } },
        { verb: 'explain', frequency: 8, classification: { domain: 'cognitive', subdomain: 'understand', confidence: 0.96 } },
        { verb: 'compare', frequency: 7, classification: { domain: 'cognitive', subdomain: 'analyze', confidence: 0.94 } },
        { verb: 'identify', frequency: 7, classification: { domain: 'cognitive', subdomain: 'remember', confidence: 0.95 } },
        { verb: 'execute', frequency: 6, classification: { domain: 'psychomotor', subdomain: 'mechanism', confidence: 0.92 } }
    ],
    recommendations: {
        main: 'The document demonstrates a strong emphasis on Cognitive higher-order thinking (62% of analyzed verbs), with healthy representation of Application and Analysis. Affective engagement and Psychomotor practice tasks are moderately integrated and could be bolstered for holistic curriculum balance.',
        cognitive: 'Strong emphasis on Analyze, Understand, and Apply. To reach highest mastery, introduce more synthesis and origination tasks (Create domain).',
        affective: 'Moderate affective engagement. Expand value internalization, reflective self-assessment, and student agency.',
        psychomotor: 'Practical and execution tasks are present. Incorporate progressive motor/dexterity ladders and iterative feedback loops.'
    },
    report: {
        filename: 'Sample_Research_Paper_Analysis.xlsx',
        url: '/api/papers/master-report'
    }
};

function App() {
    const [analysisData, setAnalysisData] = useState(() => {
        // Try restoring from sessionStorage
        try {
            const saved = sessionStorage.getItem('evalix_analysis_data');
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.warn('Could not restore cached analysis from sessionStorage');
        }
        return null;
    });

    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // Save to sessionStorage whenever analysisData changes
    const handleAnalysisComplete = (data) => {
        console.log('Evalix 2.0: Analysis complete with data:', data);
        setAnalysisData(data);
        try {
            sessionStorage.setItem('evalix_analysis_data', JSON.stringify(data));
        } catch (e) {
            console.warn('Could not cache analysis in sessionStorage');
        }
    };

    const handleLoadSample = () => {
        handleAnalysisComplete(SAMPLE_ANALYSIS_DATA);
    };

    return (
        <Router>
<<<<<<< HEAD
            <Routes>
                {/* Landing Page: Screen 1 */}
                <Route path="/landing" element={<LandingPage />} />

                {/* Main App Screens */}
                <Route
                    path="/*"
                    element={
                        <div className="app-wrapper">
                            <Header />
                            <div className="main-container">
                                <div className="d-flex">
                                    <div className="sidebar-container border-end">
                                        <Sidebar />
                                    </div>
                                    <div className="content-container p-4 flex-grow-1">
                                        <Routes>
                                            <Route
                                                path="/"
                                                element={<FileUploadPanel onAnalysisComplete={handleAnalysisComplete} />}
                                            />
                                            <Route
                                                path="/analysis"
                                                element={<AnalysisDashboard data={analysisData} />}
                                            />
                                            <Route
                                                path="/recommendations"
                                                element={<RecommendationsDashboard
                                                    recommendations={analysisData?.recommendations}
                                                    report={analysisData?.report}
                                                />}
                                            />
                                            <Route
                                                path="/reports"
                                                element={<ReportsList currentReport={analysisData?.report} />}
                                            />
                                        </Routes>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                />
            </Routes>
=======
            <div className="evalix-app-root evalix-grid-bg">
                {/* Global Top Navbar */}
                <Header />

                {/* Mobile sidebar toggle bar on narrow screens */}
                <div className="mobile-subbar d-lg-none">
                    <button 
                        className="mobile-nav-toggle-btn"
                        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                    >
                        <span>☰</span> Menu & Tools
                    </button>
                    <span className="mobile-brand-title">Evalix 2.0</span>
                </div>

                {/* Main Layout Container */}
                <div className="evalix-main-layout">
                    {/* Fixed/Sticky Dark Glass Sidebar */}
                    <Sidebar 
                        isMobileOpen={isMobileSidebarOpen}
                        setIsMobileOpen={setIsMobileSidebarOpen}
                    />

                    {/* Mobile backdrop overlay */}
                    {isMobileSidebarOpen && (
                        <div 
                            className="sidebar-backdrop"
                            onClick={() => setIsMobileSidebarOpen(false)}
                        ></div>
                    )}

                    {/* Scrollable Main Content Area */}
                    <main className="evalix-content-area">
                        <Routes>
                            {/* Main Upload / Hero Dashboard */}
                            <Route
                                path="/"
                                element={
                                    <FileUploadPanel 
                                        onAnalysisComplete={handleAnalysisComplete} 
                                    />
                                }
                            />

                            {/* View Charts */}
                            <Route
                                path="/charts"
                                element={
                                    <AnalysisDashboard 
                                        data={analysisData}
                                        onLoadSample={handleLoadSample}
                                    />
                                }
                            />
                            <Route
                                path="/analysis"
                                element={<Navigate to="/charts" replace />}
                            />

                            {/* Verb Classifications Table & Filter */}
                            <Route
                                path="/classifications"
                                element={
                                    <VerbClassificationsPage 
                                        data={analysisData}
                                        onLoadSample={handleLoadSample}
                                    />
                                }
                            />

                            {/* Recommendations */}
                            <Route
                                path="/recommendations"
                                element={
                                    <RecommendationsDashboard
                                        recommendations={analysisData?.recommendations}
                                        report={analysisData?.report}
                                        onLoadSample={handleLoadSample}
                                    />
                                }
                            />

                            {/* Excel Reports */}
                            <Route
                                path="/reports"
                                element={
                                    <ReportsList 
                                        currentReport={analysisData?.report} 
                                    />
                                }
                            />

                            {/* About Analysis Page */}
                            <Route
                                path="/about"
                                element={<AboutAnalysisPage />}
                            />

                            {/* Fallback route to home */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </main>
                </div>
            </div>
>>>>>>> origin/main
        </Router>
    );
}

export default App;
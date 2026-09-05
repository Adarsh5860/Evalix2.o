// App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/Dashboard.scss';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import FileUploadPanel from './components/FileUploadPanel';
import AnalysisDashboard from './components/AnalysisDashboard';
import RecommendationsDashboard from './components/RecommendationsDashboard';
import ReportsList from './components/ReportsList';
// App.js - Update
function App() {
    const [analysisData, setAnalysisData] = useState(null);

    const handleAnalysisComplete = (data) => {
        console.log("Analysis complete with data:", data);
        // Make sure recommendations are present in the data
        if (data && !data.recommendations && data.verbs) {
            // If for some reason recommendations aren't included, try to generate them client-side
            console.warn("Recommendations missing from API response, check server implementation");
        }
        setAnalysisData(data);
    };

    return (
        <Router>
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
        </Router>
    );
}

export default App;
// components/AboutAnalysisPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FiBookOpen, 
    FiHeart, 
    FiActivity, 
    FiCpu, 
    FiLayers, 
    FiFileText, 
    FiCheckCircle, 
    FiUploadCloud,
    FiArrowRight
} from 'react-icons/fi';
import '../styles/AboutAnalysis.scss';

const AboutAnalysisPage = () => {
    const navigate = useNavigate();

    return (
        <div className="evalix-dashboard-page about-analysis-page">
            {/* Header */}
            <div className="page-header-block mb-4 text-center">
                <div className="header-badge">
                    <span className="badge-sparkle">✦</span>
                    <span>Educational Framework & AI Architecture</span>
                </div>
                <h1 className="header-title">
                    About the <span className="gradient-text">Evalix 2.0 Analysis Engine</span>
                </h1>
                <p className="header-subtitle mx-auto">
                    Understand how Evalix parses academic literature, identifies action verbs, and applies vector embedding similarity across Bloom's Taxonomy domains.
                </p>
            </div>

            {/* Bloom's Taxonomy 3 Domains Section */}
            <div className="about-section-header">
                <h2 className="section-title">The Three Educational Domains</h2>
                <p className="section-subtitle">Categorizing pedagogical objectives into balanced learning dimensions</p>
            </div>

            <div className="domains-overview-grid mb-5">
                {/* Cognitive Domain */}
                <div className="about-domain-card glass-panel border-purple">
                    <div className="domain-card-top">
                        <div className="domain-icon-box purple">
                            <FiBookOpen />
                        </div>
                        <div>
                            <span className="domain-author">Bloom (1956), Anderson & Krathwohl (2001)</span>
                            <h3 className="domain-name">Cognitive Domain</h3>
                        </div>
                    </div>
                    <p className="domain-description">
                        Focuses on intellectual skills, knowledge acquisition, mental processing, and critical thinking progression from foundational recall to creative synthesis.
                    </p>
                    <div className="levels-ladder">
                        <div className="ladder-step"><span className="step-num">1</span> Remember</div>
                        <div className="ladder-step"><span className="step-num">2</span> Understand</div>
                        <div className="ladder-step"><span className="step-num">3</span> Apply</div>
                        <div className="ladder-step"><span className="step-num">4</span> Analyze</div>
                        <div className="ladder-step"><span className="step-num">5</span> Evaluate</div>
                        <div className="ladder-step highlight-purple"><span className="step-num">6</span> Create</div>
                    </div>
                </div>

                {/* Affective Domain */}
                <div className="about-domain-card glass-panel border-magenta">
                    <div className="domain-card-top">
                        <div className="domain-icon-box magenta">
                            <FiHeart />
                        </div>
                        <div>
                            <span className="domain-author">Krathwohl, Bloom, Masia (1964)</span>
                            <h3 className="domain-name">Affective Domain</h3>
                        </div>
                    </div>
                    <p className="domain-description">
                        Encompasses emotional intelligence, attitudes, appreciation, empathy, values internalization, and ethical behavioral commitments in educational settings.
                    </p>
                    <div className="levels-ladder">
                        <div className="ladder-step"><span className="step-num">1</span> Receiving</div>
                        <div className="ladder-step"><span className="step-num">2</span> Responding</div>
                        <div className="ladder-step"><span className="step-num">3</span> Valuing</div>
                        <div className="ladder-step"><span className="step-num">4</span> Organizing</div>
                        <div className="ladder-step highlight-magenta"><span className="step-num">5</span> Characterizing</div>
                    </div>
                </div>

                {/* Psychomotor Domain */}
                <div className="about-domain-card glass-panel border-cyan">
                    <div className="domain-card-top">
                        <div className="domain-icon-box cyan">
                            <FiActivity />
                        </div>
                        <div>
                            <span className="domain-author">Simpson (1972), Harrow (1972)</span>
                            <h3 className="domain-name">Psychomotor Domain</h3>
                        </div>
                    </div>
                    <p className="domain-description">
                        Addresses physical skills, coordination, dexterity, technical manipulation, kinesthetic execution, and neuromuscular motor mastery.
                    </p>
                    <div className="levels-ladder">
                        <div className="ladder-step"><span className="step-num">1</span> Perception</div>
                        <div className="ladder-step"><span className="step-num">2</span> Set & Guided Response</div>
                        <div className="ladder-step"><span className="step-num">3</span> Mechanism</div>
                        <div className="ladder-step"><span className="step-num">4</span> Complex Response</div>
                        <div className="ladder-step highlight-cyan"><span className="step-num">5</span> Origination</div>
                    </div>
                </div>
            </div>

            {/* Analysis Process Pipeline */}
            <div className="about-section-header">
                <h2 className="section-title">The 4-Step Analysis Pipeline</h2>
                <p className="section-subtitle">How raw documents turn into actionable pedagogical insights</p>
            </div>

            <div className="pipeline-steps-grid mb-5">
                <div className="pipeline-step-card glass-panel">
                    <div className="step-badge">Step 1</div>
                    <div className="step-icon-wrap"><FiFileText /></div>
                    <h4 className="step-title">Text Extraction</h4>
                    <p className="step-text">
                        Extracts clean textual content from PDF, DOCX, DOC, and TXT files using specialized parsers while filtering formatting artifacts.
                    </p>
                </div>

                <div className="pipeline-step-card glass-panel">
                    <div className="step-badge">Step 2</div>
                    <div className="step-icon-wrap"><FiCpu /></div>
                    <h4 className="step-title">NLP Verb Tokenization</h4>
                    <p className="step-text">
                        Identifies action verbs using Natural tokenizers and the WordPOS WordNet lexicon database, tabulating term frequency across the document.
                    </p>
                </div>

                <div className="pipeline-step-card glass-panel">
                    <div className="step-badge">Step 3</div>
                    <div className="step-icon-wrap"><FiLayers /></div>
                    <h4 className="step-title">Vector Semantic Match</h4>
                    <p className="step-text">
                        Computes high-dimensional vector embeddings with cosine similarity to align verbs to the nearest taxonomy subdomain benchmark.
                    </p>
                </div>

                <div className="pipeline-step-card glass-panel">
                    <div className="step-badge">Step 4</div>
                    <div className="step-icon-wrap"><FiCheckCircle /></div>
                    <h4 className="step-title">Insights & Reports</h4>
                    <p className="step-text">
                        Synthesizes domain balance metrics, flags pedagogical gaps, generates curriculum suggestions, and compiles downloadable Excel audits.
                    </p>
                </div>
            </div>

            {/* Call to action */}
            <div className="about-cta-card glass-panel text-center py-5">
                <h3 className="cta-heading mb-2">Ready to Analyze Your Research Document?</h3>
                <p className="cta-sub mb-4">Upload your syllabus, research publication, or course curriculum to see immediate insights.</p>
                <button 
                    className="btn-evalix-primary"
                    onClick={() => navigate('/')}
                >
                    <FiUploadCloud className="me-2" />
                    Upload Document Now
                    <FiArrowRight className="ms-2" />
                </button>
            </div>
        </div>
    );
};

export default AboutAnalysisPage;

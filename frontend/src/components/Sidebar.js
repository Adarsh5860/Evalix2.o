// components/Sidebar.js
import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
    FiUploadCloud, 
    FiBarChart2, 
    FiList, 
    FiInfo, 
    FiBookOpen,
    FiX
} from 'react-icons/fi';
import '../styles/Sidebar.scss';

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleTaxonomyClick = (domain) => {
        navigate(`/classifications?domain=${domain.toLowerCase()}`);
        if (setIsMobileOpen) setIsMobileOpen(false);
    };

    const isTaxonomyActive = (domain) => {
        if (location.pathname !== '/classifications') return false;
        const searchParams = new URLSearchParams(location.search);
        return searchParams.get('domain')?.toLowerCase() === domain.toLowerCase();
    };

    return (
        <aside className={`evalix-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
            {/* Mobile close toggle */}
            <div className="sidebar-mobile-header">
                <span className="mobile-title">Menu</span>
                <button 
                    className="mobile-close-btn"
                    onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
                    aria-label="Close menu"
                >
                    <FiX />
                </button>
            </div>

            {/* Scrollable Navigation Area */}
            <div className="sidebar-nav-scroll-area">
                {/* Section 1: Analysis Tools */}
                <div className="sidebar-section">
                    <div className="sidebar-heading">Analysis Tools</div>
                    <nav className="sidebar-nav">
                        <NavLink 
                            to="/upload" 
                            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
                        >
                            <span className="item-icon-wrap">
                                <FiUploadCloud className="nav-icon" />
                            </span>
                            <span className="item-label">Upload Document</span>
                            {(location.pathname === '/upload' || location.pathname === '/') && <span className="active-pill-glow"></span>}
                        </NavLink>

                        <NavLink 
                            to="/charts" 
                            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
                        >
                            <span className="item-icon-wrap">
                                <FiBarChart2 className="nav-icon" />
                            </span>
                            <span className="item-label">View Charts</span>
                        </NavLink>

                        <NavLink 
                            to="/classifications" 
                            className={({ isActive }) => `sidebar-nav-item ${isActive && !location.search ? 'active' : ''}`}
                            onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
                        >
                            <span className="item-icon-wrap">
                                <FiList className="nav-icon" />
                            </span>
                            <span className="item-label">Verb Classifications</span>
                        </NavLink>

                        <NavLink 
                            to="/about" 
                            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
                        >
                            <span className="item-icon-wrap">
                                <FiInfo className="nav-icon" />
                            </span>
                            <span className="item-label">About Analysis</span>
                        </NavLink>
                    </nav>
                </div>

                <div className="sidebar-divider"></div>

                {/* Section 2: Taxonomy Domains */}
                <div className="sidebar-section">
                    <div className="sidebar-heading">Taxonomy Domains</div>
                    <div className="taxonomy-nav">
                        <button
                            type="button"
                            className={`taxonomy-item ${isTaxonomyActive('cognitive') ? 'selected' : ''}`}
                            onClick={() => handleTaxonomyClick('cognitive')}
                            title="Filter Cognitive Domain Verbs"
                        >
                            <span className="domain-dot dot-cognitive"></span>
                            <span className="domain-label">Cognitive</span>
                        </button>

                        <button
                            type="button"
                            className={`taxonomy-item ${isTaxonomyActive('affective') ? 'selected' : ''}`}
                            onClick={() => handleTaxonomyClick('affective')}
                            title="Filter Affective Domain Verbs"
                        >
                            <span className="domain-dot dot-affective"></span>
                            <span className="domain-label">Affective</span>
                        </button>

                        <button
                            type="button"
                            className={`taxonomy-item ${isTaxonomyActive('psychomotor') ? 'selected' : ''}`}
                            onClick={() => handleTaxonomyClick('psychomotor')}
                            title="Filter Psychomotor Domain Verbs"
                        >
                            <span className="domain-dot dot-psychomotor"></span>
                            <span className="domain-label">Psychomotor</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Left Bottom Footer & Promo Card */}
            <div className="sidebar-bottom-section">
                <div className="sidebar-promo-card">
                    <div className="promo-icon-box">
                        <FiBookOpen className="promo-icon" />
                    </div>
                    <div className="promo-title">
                        Transforming<br />
                        Education with AI
                    </div>
                    <div className="promo-desc">
                        From documents to deeper insights.
                    </div>
                </div>

                <footer className="sidebar-copyright">
                    © 2026 Evalix 2.0. All rights reserved.
                </footer>
            </div>
        </aside>
    );
};

export default Sidebar;
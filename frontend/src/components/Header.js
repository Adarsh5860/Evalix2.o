// components/Header.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiBell, FiChevronDown } from 'react-icons/fi';
import evalixLogo from '../assets/evalix-logo.png';
import '../styles/Header.scss';

const Header = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate(`/classifications?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <header className="evalix-navbar">
            <div className="navbar-container">
                {/* Left: Brand Logo & Title */}
                <div className="navbar-brand-section">
                    <Link to="/" className="brand-logo-link">
                        <div className="brand-logo-icon">
                            <img src={evalixLogo} alt="Evalix Logo" className="brand-logo-img" />
                        </div>
                        <div className="brand-title-wrap">
                            <div className="brand-name-row">
                                <span className="brand-name">Evalix</span>
                                <span className="version-badge">2.0</span>
                            </div>
                            <span className="brand-tagline">Analyze • Understand • Improve</span>
                        </div>
                    </Link>
                </div>

                {/* Center: Search Bar */}
                <div className="navbar-search-section">
                    <div className="search-box">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search documents, verbs, or analyses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                            className="search-input"
                        />
                        {searchQuery && (
                            <button
                                className="search-clear-btn"
                                onClick={() => setSearchQuery('')}
                                title="Clear search"
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>

                {/* Right: Actions & Profile */}
                <div className="navbar-actions-section">
                    {/* Notification Icon */}
                    <div className="notification-wrapper">
                        <button
                            className="action-icon-btn notification-btn"
                            onClick={() => setNotificationsOpen(!notificationsOpen)}
                            title="Notifications"
                            aria-label="Notifications"
                        >
                            <FiBell className="action-svg" />
                            <span className="notification-dot"></span>
                        </button>
                        {notificationsOpen && (
                            <div className="navbar-dropdown notifications-dropdown">
                                <div className="dropdown-header">
                                    <span>Notifications</span>
                                    <span className="badge-count">1 New</span>
                                </div>
                                <div className="dropdown-item unread">
                                    <div className="item-title">System Ready</div>
                                    <div className="item-desc">Bloom's Taxonomy NLP pipeline is online.</div>
                                    <div className="item-time">Just now</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Profile */}
                    <div className="user-profile-wrapper">
                        <button
                            className="user-profile-btn"
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            aria-label="User menu"
                        >
                            <div className="user-avatar">TB</div>
                            <span className="user-name">User Name</span>
                            <FiChevronDown className={`dropdown-chevron ${userMenuOpen ? 'open' : ''}`} />
                        </button>
                        {userMenuOpen && (
                            <div className="navbar-dropdown user-dropdown">
                                <div className="dropdown-user-info">
                                    <div className="info-name">User Name</div>
                                    <div className="info-role">Researcher / Analyst</div>
                                </div>
                                <div className="dropdown-divider"></div>
                                <Link to="/" className="dropdown-link" onClick={() => setUserMenuOpen(false)}>
                                    Dashboard Home
                                </Link>
                                <Link to="/charts" className="dropdown-link" onClick={() => setUserMenuOpen(false)}>
                                    Analytics Overview
                                </Link>
                                <Link to="/about" className="dropdown-link" onClick={() => setUserMenuOpen(false)}>
                                    About Analysis
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
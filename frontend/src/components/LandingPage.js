import React, { useState, useEffect } from 'react';

import {
  LuLayers,
  LuSparkles,
  LuArrowRight,
  LuLogIn,
  LuShieldCheck,
  LuCircleCheck,
  LuSun,
  LuMoon,
  LuMenu,
  LuX,
  LuMail,
  LuLock
} from 'react-icons/lu';

import { useNavigate } from 'react-router-dom';

import '../styles/LandingPage.scss';

/**
 * LandingPage Component for Evalix 2.0
 *
 * Screen 1 of the app flow:
 * - Professional, modern, and aesthetically polished static landing page
 * - Features sticky glassmorphism navbar, hero copy, live metrics mockup, and minimal footer
 * - Contains placeholder hooks for auth modals, OAuth, and app navigation
 */
const LandingPage = () => {

  const navigate = useNavigate();

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Scroll detection for dynamic glassmorphism navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Theme toggle handler
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Open authentication placeholder modal
  const openAuth = (mode = 'login') => {
    setAuthModal({ isOpen: true, mode });
  };

  const closeAuth = () => {
    setAuthModal({ ...authModal, isOpen: false });
  };

  // Authentication and dashboard navigation
  const handleAuthSubmit = async (e) => {
  e.preventDefault();

  if (authModal.mode === 'login') {
    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      const data = await response.json();

      if (data.success) {
        closeAuth();
        navigate('/charts');
      } else {
        alert(data.message || 'Invalid email or password.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Unable to connect to the server. Make sure the backend is running.');
    }

    return;
  }

  alert('Sign Up is not connected yet.');
};

  return (
    <div className={`landing-page-root ${isDarkMode ? 'dark' : ''}`}>

      <div className="grid-bg-overlay"></div>

      {/* Ambient background glow orbs */}
      <div className="glow-orb-1"></div>
      <div className="glow-orb-2"></div>

      {/* ===================================================================== */}
      {/* 1. NAVBAR (Sticky Top, Dynamic Glassmorphism on Scroll)               */}
      {/* ===================================================================== */}

      <header className={`landing-nav ${isScrolled ? 'scrolled' : ''}`}>

        <div className="container-xl px-4 mx-auto">

          <div className="d-flex align-items-center justify-content-between py-3">

            {/* Left: Brand Logo / Wordmark */}

            <div
              className="d-flex align-items-center gap-3 cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >

              <div className="logo-icon">
                <LuLayers size={22} />
              </div>

              <div className="d-flex align-items-baseline gap-2">

                <span
                  className="fw-bold fs-4 tracking-tight"
                  style={{ letterSpacing: '-0.03em' }}
                >
                  Evalix
                </span>

                <span
                  className="badge rounded-pill px-2 py-1 text-xs fw-semibold"
                  style={{
                    backgroundColor: isDarkMode ? '#1e1b4b' : '#e0e7ff',
                    color: isDarkMode ? '#a5b4fc' : '#4338ca',
                    border: isDarkMode
                      ? '1px solid #3730a3'
                      : '1px solid #c7d2fe'
                  }}
                >
                  2.0
                </span>

              </div>

            </div>

            {/* Right: Actions (Theme Toggle, Login, Sign Up) */}

            <div className="d-none d-md-flex align-items-center gap-3">

              {/* Dark/Light Mode Toggle */}

              <button
                type="button"
                onClick={toggleTheme}
                className="btn btn-link text-decoration-none p-2 rounded-3 text-secondary"
                aria-label="Toggle color theme"
              >
                {isDarkMode
                  ? <LuSun size={20} color="#f8fafc" />
                  : <LuMoon size={20} color="#334155" />
                }
              </button>

              {/* PLACEHOLDER: Trigger Login */}

              <button
                type="button"
                onClick={() => openAuth('login')}
                className="btn-secondary-ghost text-sm"
              >
                Login
              </button>

              {/* PLACEHOLDER: Trigger Sign Up */}

              <button
                type="button"
                onClick={() => openAuth('signup')}
                className="btn-primary-gradient text-sm"
              >
                Sign Up
              </button>

            </div>

            {/* Mobile Menu Button */}

            <div className="d-flex d-md-none align-items-center gap-2">

              <button
                type="button"
                onClick={toggleTheme}
                className="btn btn-link text-secondary p-1"
              >
                {isDarkMode
                  ? <LuSun size={20} color="#f8fafc" />
                  : <LuMoon size={20} color="#334155" />
                }
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="btn btn-link text-secondary p-1"
              >
                {mobileMenuOpen
                  ? <LuX size={24} />
                  : <LuMenu size={24} />
                }
              </button>

            </div>

          </div>

          {/* Mobile Collapsed Menu */}

          {mobileMenuOpen && (
            <div
              className="d-md-none py-3 border-top"
              style={{
                borderColor: isDarkMode ? '#1e293b' : '#e2e8f0'
              }}
            >

              <div className="d-grid gap-2">

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuth('login');
                  }}
                  className="btn-secondary-ghost w-100"
                >
                  Login
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuth('signup');
                  }}
                  className="btn-primary-gradient w-100"
                >
                  Sign Up
                </button>

              </div>

            </div>
          )}

        </div>

      </header>

      {/* ===================================================================== */}
      {/* 2. HERO SECTION                                                       */}
      {/* ===================================================================== */}

      <main className="flex-grow-1 d-flex align-items-center justify-content-center py-5 position-relative">

        <div className="container-xl px-4">

          <div className="row align-items-center g-5">

            {/* Left Column */}

            <div className="col-12 col-lg-7 text-center text-lg-start">

              <div
                className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill mb-4"
                style={{
                  backgroundColor: isDarkMode
                    ? 'rgba(30, 27, 75, 0.7)'
                    : '#eef2ff',
                  border: isDarkMode
                    ? '1px solid rgba(99, 102, 241, 0.3)'
                    : '1px solid #c7d2fe',
                  color: isDarkMode ? '#a5b4fc' : '#4f46e5',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              >
                <span
                  className="spinner-grow spinner-grow-sm"
                  style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#6366f1'
                  }}
                ></span>

                <span>AI-Powered Evaluation Platform</span>

                <LuSparkles size={14} />

              </div>

              <h1
                className="display-4 fw-bolder tracking-tight mb-4"
                style={{ lineHeight: 1.15 }}
              >
                Next-Gen Evaluation.<br />

                <span className="gradient-text">
                  Driven by Precision AI.
                </span>

              </h1>

              <p
                className="lead mb-5 text-secondary"
                style={{
                  maxWidth: '600px',
                  margin: '0 auto 2rem auto',
                  fontSize: '1.15rem'
                }}
              >
                Evalix 2.0 helps you evaluate, analyze, and improve with AI-driven precision — fast, accurate, and effortless.
              </p>

              <div className="d-flex flex-column flex-sm-row justify-content-center justify-content-lg-start gap-3 mb-4">

                <button
                  type="button"
                  onClick={() => openAuth('signup')}
                  className="btn-primary-gradient"
                >
                  <span>Get Started</span>
                  <LuArrowRight size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => openAuth('login')}
                  className="btn-secondary-ghost"
                >
                  <LuLogIn size={18} />
                  <span>Login</span>
                </button>

              </div>

              <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start gap-4 text-xs text-secondary mt-3">

                <div className="d-flex align-items-center gap-1.5">
                  <LuCircleCheck size={16} color="#10b981" />
                  <span>Bloom's Taxonomy Framework</span>
                </div>

                <div className="d-flex align-items-center gap-1.5">
                  <LuCircleCheck size={16} color="#10b981" />
                  <span>Semantic Vector Embeddings</span>
                </div>

                <div className="d-flex align-items-center gap-1.5">
                  <LuCircleCheck size={16} color="#10b981" />
                  <span>Instant Excel Audit Reports</span>
                </div>

              </div>

            </div>

            {/* Right Column */}

            <div className="col-12 col-lg-5">

              <div className="mockup-card">

                <div
                  className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom"
                  style={{
                    borderColor: isDarkMode ? '#1e293b' : '#f1f5f9'
                  }}
                >

                  <div className="d-flex align-items-center gap-1.5">

                    <span
                      className="rounded-circle d-inline-block"
                      style={{
                        width: 10,
                        height: 10,
                        backgroundColor: '#ef4444'
                      }}
                    ></span>

                    <span
                      className="rounded-circle d-inline-block"
                      style={{
                        width: 10,
                        height: 10,
                        backgroundColor: '#f59e0b'
                      }}
                    ></span>

                    <span
                      className="rounded-circle d-inline-block"
                      style={{
                        width: 10,
                        height: 10,
                        backgroundColor: '#10b981'
                      }}
                    ></span>

                    <span className="ms-2 font-monospace text-xs text-secondary">
                      research_paper_analysis.pdf
                    </span>

                  </div>

                  <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2.5 py-1 text-xs">
                    ● Analyzed
                  </span>

                </div>

                <div className="row g-2 mb-4">

                  <div className="col-4">
                    <div
                      className="p-2.5 rounded-3"
                      style={{
                        backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc'
                      }}
                    >
                      <span
                        className="text-secondary d-block"
                        style={{ fontSize: '0.7rem' }}
                      >
                        Total Verbs
                      </span>

                      <span className="fw-bold fs-6">
                        1,428
                      </span>
                    </div>
                  </div>

                  <div className="col-4">
                    <div
                      className="p-2.5 rounded-3"
                      style={{
                        backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc'
                      }}
                    >
                      <span
                        className="text-secondary d-block"
                        style={{ fontSize: '0.7rem' }}
                      >
                        Top Domain
                      </span>

                      <span className="fw-bold fs-6 text-primary">
                        Cognitive
                      </span>
                    </div>
                  </div>

                  <div className="col-4">
                    <div
                      className="p-2.5 rounded-3"
                      style={{
                        backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc'
                      }}
                    >
                      <span
                        className="text-secondary d-block"
                        style={{ fontSize: '0.7rem' }}
                      >
                        Accuracy
                      </span>

                      <span className="fw-bold fs-6 text-success">
                        96.8%
                      </span>
                    </div>
                  </div>

                </div>

                <div className="mb-4">

                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-xs fw-semibold">
                      Taxonomy Distribution
                    </span>

                    <span className="text-xs text-secondary">
                      Weights
                    </span>
                  </div>

                  <div className="mb-2">

                    <div className="d-flex justify-content-between text-xs mb-1">
                      <span>Cognitive (Analysis & Evaluation)</span>
                      <span className="fw-semibold">68%</span>
                    </div>

                    <div className="progress" style={{ height: '6px' }}>
                      <div
                        className="progress-bar"
                        style={{
                          width: '68%',
                          backgroundColor: '#4f46e5'
                        }}
                      ></div>
                    </div>

                  </div>

                  <div className="mb-2">

                    <div className="d-flex justify-content-between text-xs mb-1">
                      <span>Affective (Valuing)</span>
                      <span className="fw-semibold">21%</span>
                    </div>

                    <div className="progress" style={{ height: '6px' }}>
                      <div
                        className="progress-bar"
                        style={{
                          width: '21%',
                          backgroundColor: '#8b5cf6'
                        }}
                      ></div>
                    </div>

                  </div>

                  <div>

                    <div className="d-flex justify-content-between text-xs mb-1">
                      <span>Psychomotor (Origination)</span>
                      <span className="fw-semibold">11%</span>
                    </div>

                    <div className="progress" style={{ height: '6px' }}>
                      <div
                        className="progress-bar"
                        style={{
                          width: '11%',
                          backgroundColor: '#06b6d4'
                        }}
                      ></div>
                    </div>

                  </div>

                </div>

                <div
                  className="pt-3 border-top"
                  style={{
                    borderColor: isDarkMode ? '#1e293b' : '#f1f5f9'
                  }}
                >

                  <span className="d-block text-secondary text-xs mb-2">
                    Detected Action Verbs
                  </span>

                  <div className="d-flex flex-wrap gap-1.5">

                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                      synthesize
                    </span>

                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                      critique
                    </span>

                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                      formulate
                    </span>

                    <span className="badge bg-secondary-subtle text-secondary">
                      demonstrate
                    </span>

                    <span className="badge bg-secondary-subtle text-secondary">
                      optimize
                    </span>

                  </div>

                </div>

                <div className="floating-badge">

                  <LuShieldCheck color="#10b981" size={18} />

                  <span className="text-xs fw-semibold">
                    AI Confidence: High
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </main>

      {/* ===================================================================== */}
      {/* 3. FOOTER                                                            */}
      {/* ===================================================================== */}

      <footer
        className="py-4 border-top"
        style={{
          borderColor: isDarkMode ? '#1e293b' : '#e2e8f0'
        }}
      >

        <div className="container-xl px-4">

          <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3 text-secondary text-xs">

            <div>
              <span>© 2026 Evalix 2.0. All rights reserved.</span>
            </div>

            <nav className="d-flex align-items-center gap-4">

              <a
                href="#privacy"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Placeholder: Privacy Policy');
                }}
                className="text-secondary text-decoration-none"
              >
                Privacy
              </a>

              <a
                href="#terms"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Placeholder: Terms of Service');
                }}
                className="text-secondary text-decoration-none"
              >
                Terms
              </a>

              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Placeholder: Contact Support');
                }}
                className="text-secondary text-decoration-none"
              >
                Contact
              </a>

            </nav>

          </div>

        </div>

      </footer>

      {/* ===================================================================== */}
      {/* 4. AUTH MODAL                                                        */}
      {/* ===================================================================== */}

      {authModal.isOpen && (

        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            zIndex: 1050
          }}
          onClick={closeAuth}
        >

          <div
            className="p-4 p-sm-5 rounded-4 position-relative"
            style={{
              maxWidth: '440px',
              width: '100%',
              backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
              border: isDarkMode
                ? '1px solid #1e293b'
                : '1px solid #e2e8f0',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)'
            }}
            onClick={(e) => e.stopPropagation()}
          >

            {/* Close Button */}

            <button
              type="button"
              onClick={closeAuth}
              className="btn btn-link position-absolute top-0 end-0 p-3 text-secondary text-decoration-none"
            >
              <LuX size={20} />
            </button>

            {/* Modal Title */}

            <div className="text-center mb-4">

              <h3 className="fw-bold mb-1">
                {authModal.mode === 'signup'
                  ? 'Create your Evalix 2.0 Account'
                  : 'Welcome back to Evalix 2.0'}
              </h3>

              <p className="text-secondary text-sm mb-0">
                {authModal.mode === 'signup'
                  ? 'Start evaluating documents with precision AI'
                  : 'Sign in to access your evaluations and reports'}
              </p>

            </div>

            {/* Form */}

            <form onSubmit={handleAuthSubmit}>

              <div className="mb-3">

                <label className="form-label text-xs fw-semibold">
                  Email Address
                </label>

                <div className="input-group">

                  <span
                    className="input-group-text bg-transparent border-end-0 text-secondary"
                    style={{
                      borderColor: isDarkMode ? '#334155' : '#cbd5e1'
                    }}
                  >
                    <LuMail size={16} />
                  </span>

                  <input
                    type="email"
                    required
                    placeholder="you@institution.edu"
                    className={`form-control border-start-0 ${isDarkMode ? 'bg-dark text-white' : ''}`}
                    style={{
                      borderColor: isDarkMode ? '#334155' : '#cbd5e1'
                    }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                </div>

              </div>

              <div className="mb-4">

                <label className="form-label text-xs fw-semibold">
                  Password
                </label>

                <div className="input-group">

                  <span
                    className="input-group-text bg-transparent border-end-0 text-secondary"
                    style={{
                      borderColor: isDarkMode ? '#334155' : '#cbd5e1'
                    }}
                  >
                    <LuLock size={16} />
                  </span>

                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className={`form-control border-start-0 ${isDarkMode ? 'bg-dark text-white' : ''}`}
                    style={{
                      borderColor: isDarkMode ? '#334155' : '#cbd5e1'
                    }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                </div>

              </div>

              <button
                type="submit"
                className="btn-primary-gradient w-100 py-2.5"
              >
                {authModal.mode === 'signup' ? 'Sign Up' : 'Sign In'}
              </button>

            </form>

            <div
              className="mt-4 p-2.5 rounded-3 text-center"
              style={{
                backgroundColor: isDarkMode
                  ? 'rgba(30, 27, 75, 0.4)'
                  : '#eef2ff',
                border: isDarkMode
                  ? '1px solid rgba(99, 102, 241, 0.2)'
                  : '1px solid #c7d2fe',
                fontSize: '0.75rem',
                color: isDarkMode ? '#a5b4fc' : '#4338ca'
              }}
            >
              💡 <strong>Note:</strong> UI prototype screen. Authentication will be wired to the Evalix backend API.
            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default LandingPage;
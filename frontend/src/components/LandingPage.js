import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LuSun,
  LuMoon,
  LuMenu,
  LuX,
  LuMail,
  LuLock,
} from 'react-icons/lu';
import '../styles/LandingPage.scss';

/**
 * LandingPage — Screen 1 of the Evalix 2.0 app flow.
 *
 * Academic paper-and-ink aesthetic.  All auth buttons are placeholders —
 * wire to your backend (POST /api/auth/login, etc.) when ready.
 */
const LandingPage = () => {
  const navigate = useNavigate();

  // ── Theme state ────────────────────────────────────────────────────────
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    // BUG FIX #1: respect OS preference, don't force dark
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // ── Mobile menu ────────────────────────────────────────────────────────
  const [menuOpen, setMenuOpen] = useState(false);

  // ── Auth modal ─────────────────────────────────────────────────────────
  const [auth, setAuth] = useState({ open: false, mode: 'login' });

  const openAuth = (mode) => setAuth({ open: true, mode });
  const closeAuth = () => setAuth({ ...auth, open: false });

  const handleSubmit = (e) => {
    e.preventDefault();
    /**
     * PLACEHOLDER — connect to backend here:
     * - POST /api/auth/login   (mode === 'login')
     * - POST /api/auth/register (mode === 'signup')
     */
    alert(`Placeholder (${auth.mode}): connect to your auth backend.`);
    closeAuth();
    navigate('/');
  };

  // ── Bloom's Taxonomy SVG Pyramid ───────────────────────────────────────
  const pyramidLevels = [
    { label: 'Remember',   w: 132, x: 4,  accent: false },
    { label: 'Understand',  w: 110, x: 15, accent: false },
    { label: 'Apply',       w: 88,  x: 26, accent: false },
    { label: 'Analyze',     w: 66,  x: 37, accent: false },
    { label: 'Evaluate',    w: 48,  x: 46, accent: true  },
    { label: 'Create',      w: 34,  x: 53, accent: true  },
  ];

  // Detect prefers-reduced-motion
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div className={`landing-root ${isDark ? 'dark' : ''}`}>

      {/* ================================================================ */}
      {/* NAVBAR                                                           */}
      {/* ================================================================ */}
      <header className="landing-nav">
        <div className="container" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px' }}>
          <div className="d-flex align-items-center justify-content-between" style={{ height: 64 }}>

            {/* Wordmark */}
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="d-flex align-items-baseline gap-2 bg-transparent border-0 p-0"
              style={{ cursor: 'pointer' }}
            >
              <span className="nav-wordmark">Evalix</span>
              <span className="nav-version-badge">2.0</span>
            </button>

            {/* Desktop actions */}
            <div className="d-none d-md-flex align-items-center gap-3">
              <button
                type="button"
                onClick={() => setIsDark(!isDark)}
                className="bg-transparent border-0 p-2"
                aria-label="Toggle color theme"
                style={{ cursor: 'pointer', color: 'inherit', opacity: 0.5 }}
              >
                {isDark ? <LuSun size={18} /> : <LuMoon size={18} />}
              </button>
              <button type="button" onClick={() => openAuth('login')}  className="btn-outline">Log in</button>
              <button type="button" onClick={() => openAuth('signup')} className="btn-primary">Sign up</button>
            </div>

            {/* Mobile */}
            <div className="d-flex d-md-none align-items-center gap-1">
              <button
                type="button"
                onClick={() => setIsDark(!isDark)}
                className="bg-transparent border-0 p-2"
                style={{ cursor: 'pointer', color: 'inherit', opacity: 0.5 }}
                aria-label="Toggle color theme"
              >
                {isDark ? <LuSun size={18} /> : <LuMoon size={18} />}
              </button>
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="bg-transparent border-0 p-2"
                style={{ cursor: 'pointer', color: 'inherit', opacity: 0.7 }}
                aria-label="Open menu"
              >
                {menuOpen ? <LuX size={20} /> : <LuMenu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile menu dropdown */}
          {menuOpen && (
            <div className="d-md-none pb-3" style={{ display: 'grid', gap: 8 }}>
              <button type="button" onClick={() => { setMenuOpen(false); openAuth('login'); }}  className="btn-outline w-100">Log in</button>
              <button type="button" onClick={() => { setMenuOpen(false); openAuth('signup'); }} className="btn-primary w-100">Sign up</button>
            </div>
          )}
        </div>
      </header>

      {/* ================================================================ */}
      {/* HERO                                                              */}
      {/* ================================================================ */}
      <main className="flex-grow-1 d-flex align-items-center">
        <div className="container" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px' }}>
          <div className="row align-items-center g-5 py-5">

            {/* ── Left: Copy ─────────────────────────────────────────── */}
            <div className="col-12 col-lg-5 text-center text-lg-start">

              <h1 className="hero-headline mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)' }}>
                Grade like you<br />read every&nbsp;line.
              </h1>

              <p style={{ maxWidth: 440, margin: '0 auto 1.8rem', lineHeight: 1.7, opacity: 0.65, fontSize: '1.05rem' }}
                 className="mx-lg-0">
                Upload a syllabus, exam paper, or rubric. Evalix extracts every action verb, maps it to Bloom's Taxonomy,
                and shows you where cognitive demand is strong, weak, or missing&nbsp;— in&nbsp;seconds.
              </p>

              {/* CTAs */}
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start mb-4">
                <button type="button" onClick={() => openAuth('signup')} className="btn-primary" style={{ padding: '10px 24px' }}>
                  Get started
                </button>
                <button type="button" onClick={() => {
                  document.getElementById('samplePaper')?.scrollIntoView({ behavior: 'smooth' });
                }} className="btn-outline" style={{ padding: '10px 24px' }}>
                  See a sample grade
                </button>
              </div>

              {/* What it checks */}
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', opacity: 0.55, maxWidth: 380 }}
                  className="mx-auto mx-lg-0">
                {[
                  'Verb-level cognitive demand (all 6 Bloom\'s levels)',
                  'Coverage across cognitive, affective & psychomotor domains',
                  'Gap analysis with actionable verb suggestions',
                ].map((text, i) => (
                  <li key={i} className="d-flex align-items-start gap-2 mb-1">
                    <span className="check-icon">✓</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Right: Annotated Document ──────────────────────────── */}
            <div className="col-12 col-lg-7" id="samplePaper">
              <div className="paper-mockup" style={{ maxWidth: 580, margin: '0 auto' }}>

                {/* Red margin line */}
                <div className="margin-line" />

                {/* Paper content */}
                <div style={{ paddingLeft: 68, paddingRight: 20, paddingTop: 24, paddingBottom: 24 }}>

                  {/* Header */}
                  <div style={{ paddingBottom: 8, marginBottom: 20, opacity: 0.4 }}>
                    <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>
                      Course Evaluation — CS 301: Data Structures
                    </p>
                    <p style={{ fontSize: '0.7rem', margin: 0 }}>
                      Mid-Semester Examination · 60 marks · 90 min
                    </p>
                  </div>

                  {/* Question items */}
                  <div style={{ fontSize: '0.875rem', lineHeight: 1.8 }} className="d-flex flex-column gap-4">

                    {/* Q1 */}
                    <div>
                      <p style={{ opacity: 0.8, margin: 0 }}>
                        <strong>Q1.</strong>{' '}
                        <span className="circled-red"><strong>Define</strong></span>{' '}
                        the properties of a balanced binary search tree.{' '}
                        <span style={{ opacity: 0.4 }}>[10 marks]</span>
                      </p>
                      <p className="annotation-red" style={{ marginTop: 4, marginBottom: 0 }}>
                        Remember level — consider "compare" or "analyze"
                      </p>
                    </div>

                    {/* Q3 */}
                    <div>
                      <p style={{ opacity: 0.8, margin: 0 }}>
                        <strong>Q3.</strong>{' '}
                        <span className="circled-green"><strong>Evaluate</strong></span>{' '}
                        and{' '}
                        <span className="circled-green"><strong>compare</strong></span>{' '}
                        the time complexity of three sorting algorithms for the given dataset.{' '}
                        <span style={{ opacity: 0.4 }}>[25 marks]</span>
                      </p>
                      <p className="annotation-green" style={{ marginTop: 4, marginBottom: 0 }}>
                        ✓ Higher-order thinking — Evaluate + Analyze
                      </p>
                    </div>

                    {/* Q5 */}
                    <div>
                      <p style={{ opacity: 0.8, margin: 0 }}>
                        <strong>Q5.</strong>{' '}
                        <span className="circled-red"><strong>List</strong></span>{' '}
                        the applications of graph traversal algorithms.{' '}
                        <span style={{ opacity: 0.4 }}>[10 marks]</span>
                      </p>
                      <p className="annotation-red" style={{ marginTop: 4, marginBottom: 0 }}>
                        Remember level — try "design" or "construct"
                      </p>
                    </div>

                    {/* Q7 */}
                    <div>
                      <p style={{ opacity: 0.8, margin: 0 }}>
                        <strong>Q7.</strong>{' '}
                        <span className="circled-green"><strong>Design</strong></span>{' '}
                        a hash table with chaining to handle a minimum load factor of 0.75.{' '}
                        <span style={{ opacity: 0.4 }}>[15 marks]</span>
                      </p>
                      <p className="annotation-green" style={{ marginTop: 4, marginBottom: 0 }}>
                        ✓ Create level — strong
                      </p>
                    </div>
                  </div>
                </div>

                {/* EVALUATED stamp */}
                <div className="stamp">Evaluated</div>

                {/* Bloom's Taxonomy Pyramid */}
                <div
                  style={{ position: 'absolute', bottom: 16, right: 16, width: 130 }}
                  aria-label="Bloom's Taxonomy pyramid — levels animate from Remember at the base to Create at the top"
                >
                  <svg viewBox="0 0 140 156" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" style={{ width: '100%' }}>
                    {pyramidLevels.map((level, i) => {
                      const y = 130 - i * 24;
                      const style = reducedMotion ? { opacity: 1 } : {
                        opacity: 0.12,
                        animation: `revealLevel 0.5s ease-out ${0.3 * (i + 1)}s forwards`,
                      };
                      return (
                        <g key={level.label} style={style}>
                          <rect
                            x={level.x}
                            y={y}
                            width={level.w}
                            height={22}
                            rx={1}
                            fill={level.accent ? 'rgba(75,107,58,0.15)' : (isDark ? 'rgba(237,230,214,0.06)' : 'rgba(28,35,51,0.05)')}
                            stroke={level.accent ? 'rgba(75,107,58,0.4)' : (isDark ? '#2A2D3A' : '#C9BFA8')}
                            strokeWidth={0.75}
                          />
                          <text
                            x={70}
                            y={y + 15}
                            textAnchor="middle"
                            fill={level.accent ? '#4B6B3A' : (isDark ? 'rgba(237,230,214,0.5)' : 'rgba(28,35,51,0.5)')}
                            fontSize={8}
                            fontFamily="Inter, sans-serif"
                            fontWeight={level.accent ? 600 : 500}
                          >
                            {level.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>

      {/* ================================================================ */}
      {/* FOOTER                                                            */}
      {/* ================================================================ */}
      <footer className="landing-footer">
        <div className="container" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px' }}>
          <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3" style={{ fontSize: '0.75rem', opacity: 0.4 }}>
            <span>© 2026 Evalix 2.0. All rights reserved.</span>
            <nav className="d-flex align-items-center gap-4">
              <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('Placeholder: Privacy Policy'); }}>Privacy</a>
              <a href="#terms"   onClick={(e) => { e.preventDefault(); alert('Placeholder: Terms of Service'); }}>Terms</a>
              <a href="#contact" onClick={(e) => { e.preventDefault(); alert('Placeholder: Contact'); }}>Contact</a>
            </nav>
          </div>
        </div>
      </footer>

      {/* ================================================================ */}
      {/* AUTH MODAL (placeholder)                                          */}
      {/* ================================================================ */}
      {auth.open && (
        <div className="auth-overlay" onClick={closeAuth}>
          <div className="auth-card" onClick={(e) => e.stopPropagation()}>

            <button
              type="button"
              onClick={closeAuth}
              className="bg-transparent border-0 position-absolute"
              style={{ top: 12, right: 12, cursor: 'pointer', opacity: 0.4 }}
              aria-label="Close"
            >
              <LuX size={16} />
            </button>

            <div className="text-center mb-4">
              <h3 className="auth-title">
                {auth.mode === 'signup' ? 'Create an Evalix account' : 'Welcome back'}
              </h3>
              <p style={{ fontSize: '0.8rem', opacity: 0.5, margin: '4px 0 0' }}>
                {auth.mode === 'signup' ? 'Start grading documents in minutes' : 'Sign in to access your evaluations'}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, opacity: 0.7, marginBottom: 4 }}>Email</label>
                <div className="position-relative">
                  <LuMail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                  <input type="email" required placeholder="you@institution.edu" className="auth-input" />
                </div>
              </div>
              <div className="mb-3">
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, opacity: 0.7, marginBottom: 4 }}>Password</label>
                <div className="position-relative">
                  <LuLock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                  <input type="password" required placeholder="••••••••" className="auth-input" />
                </div>
              </div>
              <button type="submit" className="btn-primary w-100" style={{ marginTop: 4, padding: '10px 0' }}>
                {auth.mode === 'signup' ? 'Sign up' : 'Sign in'}
              </button>
            </form>

            <p style={{ fontSize: '0.68rem', textAlign: 'center', opacity: 0.35, marginTop: 12, paddingTop: 12, borderTop: '1px solid', borderColor: 'inherit' }}>
              UI prototype — authentication will be connected to the Evalix API.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default LandingPage;

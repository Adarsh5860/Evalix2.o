// components/CreditsPage.js
import React from 'react';
import {
    FiGithub,
    FiMail,
    FiUser,
    FiCode,
    FiShield,
    FiAward,
    FiBookOpen,
    FiCpu,
    FiLayers,
    FiFileText,
    FiCheckCircle,
    FiHeart
} from 'react-icons/fi';
import '../styles/Credits.scss';

const TEAM_MEMBERS = [
    {
        name: 'Mr. Adarsh Patil',
        rollNo: '246109067',
        role: 'Project Lead & Core Developer',
        avatar: '🧑‍💻',
        color: 'purple',
        github: 'Adarsh5860',
        contributions: [
            'Project architecture & system design',
            'Bloom\'s Taxonomy verb extraction engine',
            'NLP pipeline — tokenization & classification',
            'Vector semantic similarity matching',
            'Excel report generation (ExcelJS)',
            'Quality scoring algorithm & archetypes',
            'Backend API design (Express.js)',
            'Master report aggregation'
        ]
    },
    {
        name: 'Mr. Tejas Buddhewar',
        rollNo: '246109008',
        role: 'Frontend & Quality Module Developer',
        avatar: '👨‍💻',
        color: 'cyan',
        github: 'Tejas0180',
        contributions: [
            'Quality Check Panel UI & workflow',
            'Analysis Dashboard charts (Chart.js)',
            'Verb Classifications page design',
            'Recommendations Dashboard layout',
            'Document type profile integration',
            'Responsive sidebar navigation',
            'Frontend component architecture'
        ]
    },
    {
        name: 'Mr. Om Virulkar',
        rollNo: '246109058',
        role: 'Auth & Certificate Module Developer',
        avatar: '💻',
        color: 'magenta',
        github: 'om-vir58',
        contributions: [
            'User authentication system (JWT)',
            'Login & Registration flow',
            'Certificate generation engine',
            'Certificate modal & preview UI',
            'Credits & contribution page',
            'Git workflow & PR management',
            'API integration for certificates'
        ]
    }
];

const FACULTY_GUIDE = {
    name: 'Dr. A. J. Umbarkar',
    designation: 'Faculty Guide',
    department: 'Department of Information Technology',
    institution: 'Walchand College of Engineering, Sangli'
};

const TECH_STACK = [
    { name: 'React.js', icon: <FiCode />, desc: 'Frontend UI framework' },
    { name: 'Node.js + Express', icon: <FiCpu />, desc: 'Backend API server' },
    { name: 'Chart.js', icon: <FiLayers />, desc: 'Data visualization' },
    { name: 'NLP / WordPOS', icon: <FiFileText />, desc: 'Verb tokenization' },
    { name: 'JWT Auth', icon: <FiShield />, desc: 'User authentication' },
    { name: 'ExcelJS', icon: <FiCheckCircle />, desc: 'Report generation' }
];

const CreditsPage = () => {
    return (
        <div className="evalix-dashboard-page credits-page">
            {/* Header */}
            <div className="page-header-block mb-4 text-center">
                <div className="header-badge">
                    <span className="badge-sparkle">✦</span>
                    <span>Team & Contributions</span>
                </div>
                <h1 className="header-title">
                    <span className="gradient-text">Evalix 2.0</span> Credits
                </h1>
                <p className="header-subtitle mx-auto">
                    Meet the team behind Evalix 2.0 — an AI-powered academic document analyzer built as a Mini Project at Walchand College of Engineering, Sangli.
                </p>
            </div>

            {/* Faculty Guide Card */}
            <div className="credits-section-header">
                <h2 className="section-title">Faculty Guide</h2>
                <p className="section-subtitle">Under the guidance and mentorship of</p>
            </div>

            <div className="faculty-card glass-panel mb-5">
                <div className="faculty-icon-box">
                    <FiBookOpen />
                </div>
                <div className="faculty-info">
                    <h3 className="faculty-name">{FACULTY_GUIDE.name}</h3>
                    <p className="faculty-designation">{FACULTY_GUIDE.designation}</p>
                    <p className="faculty-dept">{FACULTY_GUIDE.department}</p>
                    <p className="faculty-inst">{FACULTY_GUIDE.institution}</p>
                </div>
            </div>

            {/* Team Members */}
            <div className="credits-section-header">
                <h2 className="section-title">Project Contributors</h2>
                <p className="section-subtitle">Individual contributions to the Evalix 2.0 platform</p>
            </div>

            <div className="team-grid mb-5">
                {TEAM_MEMBERS.map((member, index) => (
                    <div key={index} className={`team-card glass-panel border-${member.color}`}>
                        {/* Card Header */}
                        <div className="team-card-header">
                            <div className={`team-avatar ${member.color}`}>
                                <span className="avatar-emoji">{member.avatar}</span>
                            </div>
                            <div className="team-info">
                                <h3 className="team-name">{member.name}</h3>
                                <span className="team-roll">Roll No: {member.rollNo}</span>
                                <span className={`team-role role-${member.color}`}>{member.role}</span>
                            </div>
                        </div>

                        {/* GitHub Link */}
                        {member.github && (
                            <a
                                href={`https://github.com/${member.github}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`github-link github-${member.color}`}
                            >
                                <FiGithub />
                                <span>github.com/{member.github}</span>
                            </a>
                        )}

                        {/* Contributions List */}
                        <div className="contributions-section">
                            <h4 className="contrib-heading">
                                <FiAward className="contrib-icon" />
                                Key Contributions
                            </h4>
                            <ul className="contrib-list">
                                {member.contributions.map((item, i) => (
                                    <li key={i} className="contrib-item">
                                        <span className={`contrib-dot dot-${member.color}`}></span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tech Stack */}
            <div className="credits-section-header">
                <h2 className="section-title">Technology Stack</h2>
                <p className="section-subtitle">Built with modern web technologies</p>
            </div>

            <div className="tech-grid mb-5">
                {TECH_STACK.map((tech, index) => (
                    <div key={index} className="tech-card glass-panel">
                        <div className="tech-icon-wrap">{tech.icon}</div>
                        <h4 className="tech-name">{tech.name}</h4>
                        <p className="tech-desc">{tech.desc}</p>
                    </div>
                ))}
            </div>

            {/* Project Info Footer */}
            <div className="credits-footer glass-panel text-center py-4 mb-4">
                <div className="footer-icon-row">
                    <FiHeart className="footer-heart" />
                </div>
                <h3 className="footer-heading">
                    Evalix 2.0 — Mini Project (2025–26)
                </h3>
                <p className="footer-dept">
                    Department of Information Technology
                </p>
                <p className="footer-inst">
                    Walchand College of Engineering, Sangli
                </p>
                <p className="footer-copy">
                    © 2026 Evalix 2.0. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default CreditsPage;

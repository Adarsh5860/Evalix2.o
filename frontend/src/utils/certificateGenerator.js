// utils/certificateGenerator.js
/**
 * Evalix 2.0 - Academic Report Quality & Learning Domain Certificate Generator
 * Modeled after the prestigious diploma aesthetic from QMetric with full Bloom's Taxonomy & OBE accreditation.
 */

// Format date helper
export const formatCertDate = (isoOrDate) => {
    if (!isoOrDate) {
        return new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    const d = new Date(isoOrDate);
    if (isNaN(d.getTime())) {
        return new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// Generates persistent, professional certificate ID
export const generateVerificationId = (filename = '', score = 80) => {
    let hash = 0;
    const str = `${filename}_${score}_evalix_2026`;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0').slice(0, 8);
    return `EVX-2026-CERT-${hex}`;
};

// Clean display title
export const cleanDocumentTitle = (filename) => {
    if (!filename) return 'Academic Project Report';
    return filename
        .replace(/_analysis_\d+\.xlsx$/i, '')
        .replace(/\.pdf$/i, '')
        .replace(/\.docx?$/i, '')
        .replace(/_/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

// Normalize and build certificate payload from any analysis or quality check source
export const formatCertificateData = (source = {}) => {
    const quality = source.qualityScore || source.qualityResult || source.quality || {};
    const docInfo = source.documentInfo || source.paperInfo || source.selectedReport || {};
    const filename = docInfo.filename || source.filename || 'Document_Report.pdf';

    const overallScore = typeof quality.overallScore === 'number' 
        ? quality.overallScore 
        : (source.overallScore || 85);

    const structuralScore = typeof quality.structuralScore === 'number'
        ? quality.structuralScore
        : (source.structuralScore || 88);

    const bloomsScore = typeof quality.bloomsAlignmentScore === 'number'
        ? quality.bloomsAlignmentScore
        : (source.bloomsAlignmentScore || 82);

    const gradeBand = quality.gradeBand || source.gradeBand || (overallScore >= 85 ? 'A' : overallScore >= 70 ? 'B' : 'C');
    const grade = quality.grade || source.grade || (overallScore >= 85 ? 'Exemplary' : overallScore >= 70 ? 'Proficient' : 'Developing');
    const gradeColor = quality.gradeColor || source.gradeColor || (overallScore >= 85 ? '#10B981' : overallScore >= 70 ? '#3B82F6' : '#F59E0B');

    let totalVerbs = source.totalVerbCount || 0;
    if (!totalVerbs && source.domains) {
        totalVerbs = (source.domains.cognitive?.count || 0) +
                     (source.domains.affective?.count || 0) +
                     (source.domains.psychomotor?.count || 0);
    }
    if (!totalVerbs && quality.totalVerbs) {
        totalVerbs = quality.totalVerbs;
    }
    if (!totalVerbs) totalVerbs = 142;

    const certId = source.certificateId || generateVerificationId(filename, overallScore);

    return {
        certificateId: certId,
        filename: filename,
        documentTitle: source.documentTitle || cleanDocumentTitle(filename),
        documentType: source.documentType || quality.documentType || 'Project Report',
        candidateName: source.candidateName || 'Mr. Adarsh Patil, Mr. Om Virulkar, Mr. Tejas Buddhewar',
        institution: source.institution || 'Walchand College of Engineering, Sangli',
        department: source.department || 'Department of Information Technology',
        facultyGuide: source.facultyGuide || 'Dr. A. J. Umbarkar',
        academicYear: source.academicYear || '2026 – 2027',
        overallScore: Math.round(overallScore * 10) / 10,
        gradeBand,
        grade,
        gradeColor,
        structuralScore: Math.round(structuralScore),
        bloomsAlignmentScore: Math.round(bloomsScore),
        totalVerbs,
        evaluatedAt: formatCertDate(quality.evaluatedAt || source.evaluatedAt || docInfo.analyzedAt || new Date()),
        status: 'Verified & Accredited'
    };
};

/**
 * Generates the complete HTML string for the certificate with high-res vector SVGs,
 * luxury watermark, gold seal, and print-ready styles.
 */
export const generateCertificateHtml = (data = {}, autoPrint = true) => {
    const cert = formatCertificateData(data);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quality & Learning Domain Certificate - ${cert.documentTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Libre Baskerville', Georgia, serif;
      background: #cfccc6;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      min-height: 100vh;
      padding: 30px 20px;
      color: #1a1a24;
      -webkit-font-smoothing: antialiased;
    }

    .certificate-container {
      width: 794px;
      min-height: 1120px;
      background: #faf7f2;
      position: relative;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
      overflow: hidden;
      border: 1px solid #e2ddd3;
    }

    /* Crosshatch / Diamond Security Watermark */
    .cert-watermark {
      position: absolute;
      inset: 0;
      background-image:
        repeating-linear-gradient(45deg,  rgba(190, 160, 90, 0.065) 0, rgba(190, 160, 90, 0.065) 1px, transparent 1px, transparent 18px),
        repeating-linear-gradient(-45deg, rgba(190, 160, 90, 0.065) 0, rgba(190, 160, 90, 0.065) 1px, transparent 1px, transparent 18px);
      z-index: 1;
      pointer-events: none;
    }

    /* Fine Inner Border */
    .cert-inner-frame {
      position: absolute;
      inset: 16px;
      border: 1.5px solid rgba(201, 168, 76, 0.55);
      pointer-events: none;
      z-index: 2;
    }
    .cert-inner-frame::after {
      content: '';
      position: absolute;
      inset: 3px;
      border: 0.5px solid rgba(13, 27, 75, 0.25);
    }

    /* Wave SVGs */
    .wave-tr {
      position: absolute;
      top: 0;
      right: 0;
      width: 340px;
      height: 290px;
      z-index: 2;
      display: block;
    }
    .wave-bl {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 340px;
      height: 290px;
      z-index: 2;
      display: block;
    }

    /* Main Content Layer */
    .cert-body {
      position: relative;
      z-index: 3;
      padding: 50px 68px 46px 68px;
    }

    /* Header Row */
    .header-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 2px;
    }

    .title-block {
      flex: 1;
      padding-right: 20px;
    }

    .cert-title {
      font-family: 'Dancing Script', cursive;
      font-size: 50px;
      font-weight: 700;
      color: #0d1b4b;
      line-height: 1.15;
      margin: 0;
      text-shadow: 0 1px 1px rgba(0,0,0,0.05);
    }

    .by-evalix {
      font-family: 'Montserrat', sans-serif;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 3.5px;
      color: #0d1b4b;
      margin-top: 10px;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .by-evalix .evalix-accent {
      color: #7c3aed;
    }
    .by-evalix .sub-badge {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1.5px;
      background: rgba(124, 58, 237, 0.1);
      color: #6d28d9;
      padding: 2px 7px;
      border-radius: 4px;
      border: 1px solid rgba(124, 58, 237, 0.25);
    }

    .badge-wrap {
      flex-shrink: 0;
      margin-top: 4px;
    }

    /* Certification Intro Statement */
    .intro-para {
      font-family: 'Libre Baskerville', serif;
      font-size: 12.5px;
      line-height: 1.9;
      color: #22222b;
      text-align: center;
      margin-top: 26px;
      margin-bottom: 20px;
    }

    /* Detailed Dynamic Credentials Paragraph */
    .detail-para {
      font-family: 'Libre Baskerville', serif;
      font-size: 12px;
      line-height: 2.05;
      color: #1a1a24;
      text-align: center;
      margin-bottom: 22px;
      padding: 0 8px;
    }

    .blank {
      display: inline-block;
      min-width: 70px;
      border-bottom: 1.5px solid #222;
      vertical-align: bottom;
      padding: 0 6px 1px 6px;
      font-style: italic;
      font-weight: 700;
      color: #0d1b4b;
    }

    /* Assessment Matrix Block */
    .assessment-block {
      background: rgba(255, 255, 255, 0.55);
      border: 1px solid rgba(201, 168, 76, 0.45);
      border-radius: 8px;
      padding: 14px 20px 12px 20px;
      margin-bottom: 22px;
      font-family: 'Libre Baskerville', serif;
      font-size: 11.5px;
      color: #1a1a24;
    }
    .assessment-block-title {
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
      font-size: 11px;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      color: #0d1b4b;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .assessment-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 16px;
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .assessment-grid li {
      font-weight: 600;
      line-height: 1.5;
      display: flex;
      align-items: center;
      gap: 6px;
      color: #2d3748;
    }
    .assessment-grid li::before {
      content: '✦';
      color: #c9a84c;
      font-size: 9px;
    }

    /* Score Showcase Center Box */
    .score-center-row {
      display: flex;
      justify-content: center;
      margin-bottom: 22px;
    }

    .score-box {
      border: 2px solid #c9a84c;
      background: rgba(255, 255, 255, 0.85);
      padding: 16px 42px 14px 42px;
      text-align: center;
      border-radius: 6px;
      box-shadow: 0 6px 18px rgba(201, 168, 76, 0.15);
      position: relative;
    }

    .score-box-title {
      font-family: 'Dancing Script', cursive;
      font-size: 27px;
      font-weight: 700;
      color: #0d1b4b;
      margin-bottom: 3px;
    }

    .score-value-row {
      font-family: 'Dancing Script', cursive;
      font-size: 32px;
      font-weight: 700;
      color: #0d1b4b;
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 4px;
    }

    .score-underline {
      display: inline-block;
      min-width: 80px;
      border-bottom: 2.5px solid #0d1b4b;
      text-align: center;
      vertical-align: bottom;
      padding: 0 4px;
    }

    .score-badges-row {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-top: 8px;
    }

    .score-mini-pill {
      font-family: 'Montserrat', sans-serif;
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: 0.5px;
      padding: 2px 8px;
      border-radius: 12px;
      text-transform: uppercase;
      background: rgba(13, 27, 75, 0.08);
      color: #0d1b4b;
    }
    .score-mini-pill.grade {
      background: rgba(16, 185, 129, 0.15);
      color: #065f46;
      border: 1px solid rgba(16, 185, 129, 0.35);
    }

    /* Three Dimensions Breakdown Strip */
    .dimensions-strip {
      display: flex;
      justify-content: space-around;
      background: rgba(13, 27, 75, 0.035);
      border-top: 1px dashed rgba(201, 168, 76, 0.5);
      border-bottom: 1px dashed rgba(201, 168, 76, 0.5);
      padding: 9px 12px;
      margin-bottom: 24px;
    }
    .dim-stat-item {
      text-align: center;
    }
    .dim-stat-val {
      font-family: 'Montserrat', sans-serif;
      font-size: 13px;
      font-weight: 800;
      color: #0d1b4b;
    }
    .dim-stat-label {
      font-family: 'Montserrat', sans-serif;
      font-size: 9.5px;
      font-weight: 600;
      letter-spacing: 0.6px;
      color: #64748b;
      text-transform: uppercase;
      margin-top: 1px;
    }

    /* Footer Row */
    .footer-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 6px;
      padding-top: 6px;
    }

    .date-block {
      text-align: center;
      min-width: 170px;
    }
    .date-line {
      width: 170px;
      border-bottom: 1.5px solid #222;
      margin-bottom: 5px;
      padding-bottom: 3px;
      font-family: 'Libre Baskerville', serif;
      font-size: 11.5px;
      font-weight: 600;
      color: #0d1b4b;
      text-align: center;
      min-height: 20px;
    }
    .date-label {
      font-family: 'Montserrat', sans-serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1px;
      color: #4b5563;
      text-transform: uppercase;
    }

    .cert-id-block {
      text-align: center;
    }
    .cert-id-tag {
      font-family: 'Montserrat', monospace, sans-serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1.2px;
      color: #475569;
      background: rgba(255, 255, 255, 0.7);
      padding: 3px 9px;
      border: 1px solid rgba(201, 168, 76, 0.4);
      border-radius: 4px;
      display: inline-block;
    }
    .cert-id-label {
      font-family: 'Montserrat', sans-serif;
      font-size: 9px;
      font-weight: 600;
      color: #64748b;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      margin-top: 3px;
    }

    .evalix-logo-block {
      text-align: right;
    }

    /* Action bar for screen view */
    .screen-actions-bar {
      position: fixed;
      top: 16px;
      right: 20px;
      display: flex;
      gap: 10px;
      z-index: 9999;
    }
    .action-btn {
      background: #0d1b4b;
      color: white;
      border: 1px solid #c9a84c;
      padding: 9px 18px;
      border-radius: 8px;
      font-family: 'Montserrat', sans-serif;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.25);
      transition: all 0.2s ease;
    }
    .action-btn:hover {
      background: #1a2f6b;
      transform: translateY(-1px);
    }
    .action-btn.secondary {
      background: #ffffff;
      color: #0d1b4b;
      border: 1px solid #cbd5e1;
    }

    /* Print Media Rules - Single Pristine A4 Sheet */
    @media print {
      body {
        background: white !important;
        padding: 0 !important;
        margin: 0 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .screen-actions-bar {
        display: none !important;
      }
      .certificate-container {
        box-shadow: none !important;
        border: none !important;
        width: 100% !important;
        min-height: 100vh !important;
        page-break-after: avoid !important;
        page-break-inside: avoid !important;
      }
      @page {
        size: A4 portrait;
        margin: 0;
      }
    }
  </style>
</head>
<body>

  <!-- Floating screen buttons -->
  <div class="screen-actions-bar">
    <button class="action-btn" onclick="window.print()">
      🖨️ Print / Save as PDF
    </button>
    <button class="action-btn secondary" onclick="window.close()">
      ✕ Close Window
    </button>
  </div>

  <div class="certificate-container">
    <!-- Diamond Watermark -->
    <div class="cert-watermark"></div>

    <!-- Fine Inner Frame -->
    <div class="cert-inner-frame"></div>

    <!-- TOP-RIGHT DECORATIVE WAVE SVG -->
    <svg class="wave-tr" viewBox="0 0 340 290" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <path d="M340,0 L340,290 Q200,250 170,155 Q120,40 340,0 Z" fill="#0d1b4b"/>
      <path d="M340,0 Q305,75 258,128 Q210,178 170,155 Q200,250 340,290" fill="none" stroke="#c9a84c" stroke-width="2.5"/>
      <path d="M340,0 Q295,65 248,118 Q202,168 180,150 Q208,245 340,290 L340,0 Z" fill="#1a2f6b" opacity="0.45"/>
    </svg>

    <!-- BOTTOM-LEFT DECORATIVE WAVE SVG -->
    <svg class="wave-bl" viewBox="0 0 340 290" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <path d="M0,290 L0,0 Q140,40 170,135 Q220,250 0,290 Z" fill="#0d1b4b"/>
      <path d="M0,290 Q35,215 82,162 Q130,112 170,135 Q140,40 0,0" fill="none" stroke="#c9a84c" stroke-width="2.5"/>
      <path d="M0,290 Q45,225 92,172 Q138,122 160,140 Q132,45 0,0 L0,290 Z" fill="#1a2f6b" opacity="0.45"/>
    </svg>

    <div class="cert-body">

      <!-- HEADER ROW -->
      <div class="header-row">
        <div class="title-block">
          <h1 class="cert-title">Academic Report<br>Quality Certificate</h1>
          <div class="by-evalix">
            BY EVALIX <span class="evalix-accent">2.0</span>
            <span class="sub-badge">LEARNING DOMAINS & OBE</span>
          </div>
        </div>

        <!-- Gold Medal Badge SVG with Ribbons and Gradients -->
        <div class="badge-wrap">
          <svg width="96" height="108" viewBox="0 0 96 108" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="outerGoldRing" cx="35%" cy="30%" r="65%">
                <stop offset="0%" stop-color="#ffe270"/>
                <stop offset="45%" stop-color="#d4a017"/>
                <stop offset="100%" stop-color="#7a5500"/>
              </radialGradient>
              <radialGradient id="goldMedalFace" cx="35%" cy="30%" r="65%">
                <stop offset="0%" stop-color="#ffd55c"/>
                <stop offset="55%" stop-color="#c99010"/>
                <stop offset="100%" stop-color="#8a5c00"/>
              </radialGradient>
            </defs>
            <!-- Left Ribbon -->
            <polygon points="22,56 38,56 33,108 16,98" fill="#c9a84c"/>
            <!-- Right Ribbon -->
            <polygon points="74,56 58,56 63,108 80,98" fill="#b8932a"/>
            <!-- Outer Gold Coin Ring -->
            <circle cx="48" cy="46" r="41" fill="url(#outerGoldRing)"/>
            <!-- Embossed Groove -->
            <circle cx="48" cy="46" r="35" fill="none" stroke="#a07820" stroke-width="2" opacity="0.65"/>
            <!-- Medal Center Face -->
            <circle cx="48" cy="46" r="32" fill="url(#goldMedalFace)"/>
            <!-- Radial Stripe Lines -->
            <line x1="48" y1="17" x2="48" y2="75" stroke="rgba(255,255,255,0.18)" stroke-width="1.3"/>
            <line x1="19" y1="46" x2="77" y2="46" stroke="rgba(255,255,255,0.18)" stroke-width="1.3"/>
            <line x1="28" y1="26" x2="68" y2="66" stroke="rgba(255,255,255,0.12)" stroke-width="1.3"/>
            <line x1="68" y1="26" x2="28" y2="66" stroke="rgba(255,255,255,0.12)" stroke-width="1.3"/>
            <!-- Star in Center -->
            <path d="M48,34 L51,42 L59,42 L53,47 L55,55 L48,50 L41,55 L43,47 L37,42 L45,42 Z" fill="#fff" opacity="0.88"/>
            <!-- Curved Gloss Highlight -->
            <ellipse cx="40" cy="38" rx="10" ry="8" fill="rgba(255,255,255,0.25)" transform="rotate(-30 40 38)"/>
          </svg>
        </div>
      </div>

      <!-- ACCREDITATION INTRO STATEMENT -->
      <p class="intro-para">
        This is to certify that the Pedagogical & Learning Domain Quality Assessment for the<br>
        academic report identified below has been systematically evaluated and validated in<br>
        accordance with Bloom's Revised Taxonomy (Cognitive, Affective, Psychomotor) and recognized<br>
        Outcome-Based Education (OBE) curriculum quality frameworks.
      </p>

      <!-- DETAIL PARAGRAPH WITH REPORT CREDENTIALS -->
      <p class="detail-para">
        The Quality Evaluation was conducted for the document titled<br>
        <span class="blank">${cert.documentTitle}</span>, categorized under the
        <span class="blank">${cert.documentType}</span> archetype, submitted by candidate(s)<br>
        <span class="blank">${cert.candidateName}</span>, Department of
        <span class="blank">${cert.department}</span>,<br>
        <span class="blank">${cert.institution}</span>, for academic session
        <span class="blank">${cert.academicYear}</span>,<br>
        under the faculty guidance and mentorship of
        <span class="blank">${cert.facultyGuide}</span>.
      </p>

      <!-- SYSTEMATIC ASSESSMENT RUBRIC BLOCK -->
      <div class="assessment-block">
        <div class="assessment-block-title">
          <span>Systematic Quantification & Alignment Framework</span>
        </div>
        <ul class="assessment-grid">
          <li>Course Outcome & Taxonomy Alignment</li>
          <li>Structural Completeness & Section Rubric</li>
          <li>Bloom's Cognitive Depth (L1–L6 Levels)</li>
          <li>Action Verb Distribution & Verification</li>
        </ul>
      </div>

      <!-- FINAL QUALITY SCORE SHOWCASE BOX -->
      <div class="score-center-row">
        <div class="score-box">
          <div class="score-box-title">Final Quality Score:</div>
          <div class="score-value-row">
            <span class="score-underline">${Number(cert.overallScore).toFixed(1)}</span>%
          </div>
          <div class="score-badges-row">
            <span class="score-mini-pill grade" style="color: ${cert.gradeColor}; border-color: ${cert.gradeColor};">
              Grade ${cert.gradeBand} • ${cert.grade}
            </span>
            <span class="score-mini-pill">OBE Validated</span>
          </div>
        </div>
      </div>

      <!-- THREE DIMENSIONS METRICS STRIP -->
      <div class="dimensions-strip">
        <div class="dim-stat-item">
          <div class="dim-stat-val">${cert.structuralScore}%</div>
          <div class="dim-stat-label">Structural Completeness</div>
        </div>
        <div class="dim-stat-item">
          <div class="dim-stat-val">${cert.bloomsAlignmentScore}%</div>
          <div class="dim-stat-label">Bloom's Taxonomy Alignment</div>
        </div>
        <div class="dim-stat-item">
          <div class="dim-stat-val">${cert.totalVerbs} Verbs</div>
          <div class="dim-stat-label">Action Verbs Quantified</div>
        </div>
      </div>

      <!-- FOOTER ROW -->
      <div class="footer-row">
        <!-- Date Block -->
        <div class="date-block">
          <div class="date-line">${cert.evaluatedAt}</div>
          <div class="date-label">Date of Evaluation</div>
        </div>

        <!-- Verification ID -->
        <div class="cert-id-block">
          <div class="cert-id-tag">${cert.certificateId}</div>
          <div class="cert-id-label">Official Verification ID</div>
        </div>

        <!-- Official Evalix Logo & Stamp SVG -->
        <div class="evalix-logo-block">
          <svg width="150" height="58" viewBox="0 0 150 58" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="evalixGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#7c3aed"/>
                <stop offset="50%" stop-color="#3b82f6"/>
                <stop offset="100%" stop-color="#06b6d4"/>
              </linearGradient>
            </defs>
            <!-- Stylized Monogram E/Q -->
            <text x="2" y="44" font-family="Georgia, 'Times New Roman', serif"
                  font-size="48" font-style="italic" font-weight="700"
                  fill="url(#evalixGrad)">E</text>
            <!-- Orbit/Crest dot -->
            <circle cx="34" cy="10" r="3.5" fill="url(#evalixGrad)"/>
            <!-- Evalix Wordmark -->
            <text x="36" y="38" font-family="'Montserrat', sans-serif"
                  font-size="20" font-weight="800" fill="#0d1b4b" letter-spacing="1.5">valix</text>
            <text x="96" y="38" font-family="'Montserrat', sans-serif"
                  font-size="14" font-weight="700" fill="#7c3aed">2.0</text>
            <!-- Micro Subtitle -->
            <text x="36" y="50" font-family="'Montserrat', sans-serif"
                  font-size="8" font-weight="600" fill="#64748b" letter-spacing="1">ACADEMIC AUDIT</text>
          </svg>
        </div>
      </div>

    </div><!-- /.cert-body -->
  </div><!-- /.certificate-container -->

  ${autoPrint ? `
  <script>
    window.onload = function() {
      // Focus and trigger print dialog with smooth buffer
      setTimeout(function() {
        try {
          window.focus();
          window.print();
        } catch (e) {
          console.warn('Auto print error:', e);
        }
      }, 750);
    };
  </script>
  ` : ''}

</body>
</html>`;
};

/**
 * Opens a print-ready new browser window with the rendered certificate,
 * exactly matching the QMetric workflow.
 */
export const openCertificatePrintWindow = (certData = {}) => {
    try {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Pop-up was blocked. Please allow popups to view and print the Certificate.');
            return false;
        }

        const html = generateCertificateHtml(certData, true);
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        return true;
    } catch (err) {
        console.error('Failed to open certificate window:', err);
        alert('Could not generate certificate: ' + err.message);
        return false;
    }
};

/**
 * Opens the certificate in a new tab without triggering auto-print immediately.
 */
export const openCertificateViewWindow = (certData = {}) => {
    try {
        const viewWindow = window.open('', '_blank');
        if (!viewWindow) {
            alert('Pop-up was blocked. Please allow popups to view the Certificate.');
            return false;
        }

        const html = generateCertificateHtml(certData, false);
        viewWindow.document.open();
        viewWindow.document.write(html);
        viewWindow.document.close();
        viewWindow.focus();
        return true;
    } catch (err) {
        console.error('Failed to view certificate:', err);
        return false;
    }
};

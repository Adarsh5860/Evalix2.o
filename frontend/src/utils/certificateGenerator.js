// frontend/src/utils/certificateGenerator.js
import QRCode from 'qrcode';

/**
 * Evalix 2.0 - Academic Report Quality & Learning Domain Certificate Generator
 * Corporate Award & Pedagogical Domain Verification Landscape A4 Certificate
 */

export const formatCertDate = (dateVal) => {
    if (!dateVal) return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// Generates persistent, professional certificate ID (e.g. EVA-2026-XXXX)
export const generateVerificationId = (filename = '', score = 85) => {
    let hash = 0;
    const str = `${filename}_${score}_evalix_2026`;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).toUpperCase().padStart(4, '0').slice(0, 4);
    return `EVA-2026-${hex}`;
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

/**
 * Synchronously generates an authentic scannable SVG QR Code
 */
export const generateQrSvgMarkup = (text, size = 64) => {
    try {
        const qr = QRCode.create(text, { errorCorrectionLevel: 'M' });
        const count = qr.modules.size;
        const cell = size / count;
        let cells = '';
        for (let row = 0; row < count; row++) {
            for (let col = 0; col < count; col++) {
                if (qr.modules.get(row, col)) {
                    cells += `<rect x="${(col * cell).toFixed(2)}" y="${(row * cell).toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}" fill="#0B1F3A" />`;
                }
            }
        }
        return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg"><rect width="${size}" height="${size}" fill="#FFFFFF"/>${cells}</svg>`;
    } catch {
        return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="#FFFFFF"/><text x="12" y="38" font-size="12" fill="#0B1F3A" font-weight="bold">QR</text></svg>`;
    }
};

// Normalize and build certificate payload from any analysis or quality check source
export const formatCertificateData = (source = {}) => {
    const quality = source.qualityScore || source.qualityResult || source.quality || {};
    const docInfo = source.documentInfo || source.paperInfo || source.selectedReport || {};
    const filename = docInfo.filename || source.filename || 'Document_Report.pdf';

    const overallScore = typeof quality.overallScore === 'number' 
        ? quality.overallScore 
        : (source.overallScore || 85);

    const gradeBand = quality.gradeBand || source.gradeBand || (overallScore >= 85 ? 'A' : overallScore >= 70 ? 'B' : 'C');
    const grade = quality.grade || source.grade || (overallScore >= 85 ? 'Exemplary' : overallScore >= 70 ? 'Proficient' : 'Developing');

    let totalVerbs = source.totalVerbCount || 0;
    if (!totalVerbs && source.domains) {
        totalVerbs = (source.domains.cognitive?.count || 0) +
                     (source.domains.affective?.count || 0) +
                     (source.domains.psychomotor?.count || 0);
    }
    if (!totalVerbs && quality.totalVerbs) {
        totalVerbs = quality.totalVerbs;
    }
    if (!totalVerbs) totalVerbs = 164;

    const cognitiveCount = source.metrics?.cognitive?.count || source.domains?.cognitive?.count || source.cognitiveCount || 104;
    const cognitivePct = source.metrics?.cognitive?.percentage !== undefined 
        ? source.metrics.cognitive.percentage 
        : (source.cognitivePct !== undefined ? source.cognitivePct : Math.round((cognitiveCount / totalVerbs) * 100) || 62);

    const affectiveCount = source.metrics?.affective?.count || source.domains?.affective?.count || source.affectiveCount || 36;
    const affectivePct = source.metrics?.affective?.percentage !== undefined 
        ? source.metrics.affective.percentage 
        : (source.affectivePct !== undefined ? source.affectivePct : Math.round((affectiveCount / totalVerbs) * 100) || 21);

    const psychomotorCount = source.metrics?.psychomotor?.count || source.domains?.psychomotor?.count || source.psychomotorCount || 24;
    const psychomotorPct = source.metrics?.psychomotor?.percentage !== undefined 
        ? source.metrics.psychomotor.percentage 
        : (source.psychomotorPct !== undefined ? source.psychomotorPct : Math.round((psychomotorCount / totalVerbs) * 100) || 14);

    const uniqueVerbs = source.metrics?.uniqueVerbs || source.uniqueVerbCount || source.uniqueVerbsCount || source.uniqueVerbs || Math.round(totalVerbs * 0.72) || 48;
    const certId = source.certificateId || source.id || generateVerificationId(filename, overallScore);
    const reportType = (source.reportType || source.documentType || quality.documentType || 'MINI PROJECT REPORT').toUpperCase();
    const recipientName = source.recipientName || source.candidateName || 'Adarsh Patil';
    const documentTitle = source.documentTitle || cleanDocumentTitle(filename);
    const qrCodeUrl = source.qrCodeUrl || '';

    return {
        certificateId: certId,
        filename: filename,
        documentTitle: documentTitle,
        recipientName: recipientName,
        reportType: reportType,
        overallScore: Math.round(overallScore),
        gradeBand,
        grade,
        cognitiveCount,
        cognitivePct,
        affectiveCount,
        affectivePct,
        psychomotorCount,
        psychomotorPct,
        totalVerbs,
        uniqueVerbs,
        qrCodeUrl,
        evaluatedAt: formatCertDate(quality.evaluatedAt || source.evaluatedAt || docInfo.analyzedAt || new Date())
    };
};

/**
 * Generates the complete HTML string for the certificate with high-res vector SVGs,
 * luxury watermark, gold seal, and print-ready styles in Landscape A4.
 */
export const generateCertificateHtml = (data = {}, autoPrint = true) => {
    const cert = formatCertificateData(data);
    const qrMarkup = cert.qrCodeUrl 
        ? `<img src="${cert.qrCodeUrl}" alt="Scan to verify QR Code" style="width: 100%; height: 100%; object-fit: contain; display: block;" />`
        : generateQrSvgMarkup(`https://evalix.education/verify?id=${encodeURIComponent(cert.certificateId)}&recipient=${encodeURIComponent(cert.recipientName)}&score=${cert.overallScore}`, 58);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate of Evaluation - ${cert.documentTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Great+Vibes&family=Inter:wght@400;500;600;700;800&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    @page {
      size: A4 landscape;
      margin: 0;
    }

    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: #0b1329;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 24px;
      color: #0B1F3A;
      -webkit-font-smoothing: antialiased;
    }

    .cert-print-bar {
      position: fixed;
      top: 14px;
      right: 20px;
      z-index: 1000;
      display: flex;
      gap: 10px;
    }

    .cert-btn-print {
      background: linear-gradient(135deg, #7C3AED, #2563EB);
      color: #fff;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(0,0,0,0.3);
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-family: 'Inter', sans-serif;
    }

    /* Standard A4 Landscape: 297mm x 210mm (~1122px x 793px at 96dpi) */
    .certificate-container {
      width: 1122px;
      height: 793px;
      background: #FFFFFF;
      position: relative;
      overflow: hidden;
      box-shadow: 0 25px 70px rgba(0, 0, 0, 0.55);
      border-radius: 4px;
    }

    /* Outer Multi-Line Gold Frame & Corner Florets */
    .cert-frame-border {
      position: absolute;
      inset: 18px;
      border: 2px solid #C9A227;
      pointer-events: none;
      z-index: 10;
    }
    .cert-frame-inner {
      position: absolute;
      inset: 4px;
      border: 0.8px solid #CBD5E1;
    }
    .frame-pip {
      position: absolute;
      width: 8px;
      height: 8px;
      background: #C9A227;
    }
    .pip-tl { top: -4px; left: -4px; }
    .pip-tr { top: -4px; right: -4px; }
    .pip-bl { bottom: -4px; left: -4px; }
    .pip-br { bottom: -4px; right: -4px; }

    /* Fine light gold guilloche line pattern layer */
    .cert-guilloche-bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    }

    /* Web App Logo Watermark in Background */
    .cert-watermark-container {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      z-index: 2;
    }
    .cert-watermark-img {
      max-width: 42%;
      max-height: 42%;
      opacity: 0.055;
      filter: grayscale(100%);
      object-fit: contain;
    }

    /* Top Wave-shaped Header SVG */
    .cert-header-wave-svg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 200px;
      z-index: 3;
      pointer-events: none;
    }

    /* Top-Left Header Content */
    .cert-top-left-header {
      position: absolute;
      top: 26px;
      left: 36px;
      z-index: 5;
      text-align: left;
      max-width: 580px;
      color: #FFFFFF;
    }
    .cert-logo-reserved-box {
      width: 120px;
      height: 34px;
      border: 1.5px dashed rgba(255, 255, 255, 0.45);
      border-radius: 5px;
      background: rgba(255, 255, 255, 0.08);
      margin-bottom: 8px;
    }
    .cert-gold-serif-title {
      font-family: 'Cinzel', Trajan, 'Times New Roman', serif;
      font-size: 20px;
      font-weight: 800;
      color: #F5D77A;
      letter-spacing: 2px;
      text-transform: uppercase;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
      line-height: 1.2;
    }
    .cert-white-domain-subtitle {
      font-family: 'Inter', sans-serif;
      font-size: 11.5px;
      font-weight: 500;
      color: #FFFFFF;
      letter-spacing: 1px;
      margin-top: 3px;
      opacity: 0.95;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
    }

    /* Left Side: Vertical Navy Ribbon & Seal */
    .cert-vertical-ribbon {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 76px;
      z-index: 4;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      padding-bottom: 30px;
    }
    .cert-ribbon-stripe {
      position: absolute;
      inset: 0;
      background: #0B1F3A;
      box-shadow: 3px 0 14px rgba(11, 31, 58, 0.35);
    }
    .cert-seal-assembly {
      position: relative;
      z-index: 5;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .cert-round-gold-badge {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 30%, #F5D77A 0%, #C9A227 60%, #8F6B12 100%);
      border: 2px solid #FDF3C7;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .seal-ring-emboss {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      border: 1px dashed #785408;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }
    .seal-text-top {
      font-family: 'Cinzel', serif;
      font-size: 7.5px;
      font-weight: 900;
      color: #0B1F3A;
      letter-spacing: 0.8px;
    }
    .seal-gold-star {
      font-size: 8px;
      color: #0B1F3A;
      margin: 2px 0;
    }
    .seal-text-bottom {
      font-family: 'Cinzel', serif;
      font-size: 8.5px;
      font-weight: 900;
      color: #0B1F3A;
      letter-spacing: 0.6px;
    }
    .cert-gold-tails {
      display: flex;
      gap: 5px;
      margin-top: -5px;
    }
    .tail-strip {
      width: 14px;
      height: 24px;
      background: linear-gradient(180deg, #F5D77A 0%, #C9A227 50%, #8F6B12 100%);
      clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 75%, 0 100%);
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
    }

    /* Main Certificate Content */
    .cert-body-layout {
      position: relative;
      z-index: 3;
      margin-left: 95px;
      margin-right: 32px;
      margin-top: 155px;
      height: 615px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding-bottom: 16px;
    }

    .cert-presented-row {
      text-align: right;
      margin-right: 40px;
      margin-bottom: 2px;
    }
    .presented-phrase {
      font-family: 'Cinzel', 'Times New Roman', serif;
      font-size: 13.5px;
      font-style: italic;
      color: #475569;
      letter-spacing: 1px;
      font-weight: 600;
    }

    .cert-student-block {
      text-align: center;
      width: 85%;
      margin: 0 auto;
    }
    .cert-student-cursive-name {
      font-family: 'Great Vibes', 'Pinyon Script', cursive;
      font-size: 48px;
      font-weight: 500;
      color: #0B1F3A;
      line-height: 1.15;
      margin-bottom: 4px;
      letter-spacing: 1px;
    }
    .cert-student-underline {
      width: 78%;
      height: 1.5px;
      background: #000000;
      opacity: 0.9;
      margin: 0 auto 10px auto;
    }

    .cert-report-block {
      text-align: center;
      margin-bottom: 10px;
    }
    .cert-report-caption {
      font-family: 'Inter', sans-serif;
      font-size: 12.5px;
      color: #64748B;
      font-weight: 500;
      margin-bottom: 2px;
    }
    .cert-report-cursive-title {
      font-family: 'Great Vibes', 'Pinyon Script', cursive;
      font-size: 26px;
      color: #1E293B;
      line-height: 1.2;
    }

    /* 4 Stat Boxes */
    .cert-four-stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      width: 95%;
      margin: 0 auto 10px auto;
    }
    .stat-pill-box {
      border-radius: 9px;
      padding: 8px 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
    }
    .stat-pill-box.box-cognitive {
      background: #F5F3FF;
      border: 1.5px solid #DDD6FE;
      .pill-title { color: #7C3AED; }
      .pill-data { color: #5B21B6; }
    }
    .stat-pill-box.box-affective {
      background: #FDF2F8;
      border: 1.5px solid #FBCFE8;
      .pill-title { color: #DB2777; }
      .pill-data { color: #9D174D; }
    }
    .stat-pill-box.box-psychomotor {
      background: #ECFEFF;
      border: 1.5px solid #A5F3FC;
      .pill-title { color: #0891B2; }
      .pill-data { color: #155E75; }
    }
    .stat-pill-box.box-quality {
      background: #FEFCE8;
      border: 1.5px solid #FDE047;
      .pill-title { color: #854D0E; }
      .pill-data { color: #713F12; }
    }
    .pill-title {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 3px;
    }
    .pill-data {
      font-size: 13.5px;
      font-weight: 800;
    }

    /* Details Line */
    .cert-single-details-line {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 14px;
      font-family: 'Inter', monospace;
      font-size: 11px;
      color: #475569;
      font-weight: 700;
      margin-bottom: 6px;
    }
    .dot-sep {
      color: #CBD5E1;
    }

    .cert-blooms-description {
      text-align: center;
      font-size: 11px;
      color: #64748B;
      font-style: italic;
      margin: 0 auto 10px auto;
      max-width: 92%;
      line-height: 1.35;
    }

    /* Bottom Triad */
    .cert-bottom-triad {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding: 0 16px;
      width: 100%;
    }
    .cert-signature-col {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      width: 220px;
    }
    .sig-handwritten-text {
      font-family: 'Great Vibes', cursive;
      font-size: 24px;
      color: #0B1F3A;
      padding-left: 10px;
      line-height: 1;
    }
    .sig-rule-line {
      width: 200px;
      height: 1.5px;
      background: #0B1F3A;
      margin: 4px 0;
    }
    .sig-label-text {
      font-size: 10.5px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .cert-center-badge-col {
      display: flex;
      justify-content: center;
      flex: 1;
    }
    .cert-report-type-gold-badge {
      background: #0B1F3A;
      border: 2px solid #C9A227;
      color: #FFFFFF;
      font-family: 'Cinzel', sans-serif;
      font-size: 11.5px;
      font-weight: 800;
      letter-spacing: 1.2px;
      padding: 7px 22px;
      border-radius: 6px;
      box-shadow: 0 3px 8px rgba(11, 31, 58, 0.3);
      text-transform: uppercase;
    }

    .cert-qr-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 110px;
    }
    .cert-qr-reserved-square {
      width: 64px;
      height: 64px;
      border-radius: 8px;
      background: #FFFFFF;
      border: 1.5px solid #CBD5E1;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .qr-caption-text {
      font-size: 9.5px;
      color: #64748B;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    @media print {
      body {
        background: none;
        padding: 0;
      }
      .cert-print-bar {
        display: none !important;
      }
      .certificate-container {
        box-shadow: none;
        border: none;
        width: 100vw;
        height: 100vh;
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>

  <div class="cert-print-bar">
    <button class="cert-btn-print" onclick="window.print()">
      Print Certificate
    </button>
  </div>

  <div class="certificate-container">
    <!-- Outer Gold Frame with Corner Florets -->
    <div class="cert-frame-border">
      <div class="cert-frame-inner"></div>
      <div class="frame-pip pip-tl"></div>
      <div class="frame-pip pip-tr"></div>
      <div class="frame-pip pip-bl"></div>
      <div class="frame-pip pip-br"></div>
    </div>

    <!-- Fine light gold guilloche line pattern layer -->
    <svg class="cert-guilloche-bg" viewBox="0 0 1122 793" preserveAspectRatio="none">
      <defs>
        <pattern id="guillochePattern" width="140" height="140" patternUnits="userSpaceOnUse">
          <path d="M0,70 C35,25 70,115 105,70 C122,45 140,70 140,70 M0,35 C45,105 95,0 140,35 M0,105 C45,35 95,140 140,105" fill="none" stroke="#C9A227" stroke-width="0.6" opacity="0.14"/>
          <circle cx="70" cy="70" r="52" fill="none" stroke="#C9A227" stroke-width="0.5" opacity="0.09"/>
          <ellipse cx="70" cy="70" rx="65" ry="30" fill="none" stroke="#C9A227" stroke-width="0.4" opacity="0.07"/>
        </pattern>
        <linearGradient id="goldCurveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#C9A227"/>
          <stop offset="50%" stop-color="#F5D77A"/>
          <stop offset="100%" stop-color="#C9A227"/>
        </linearGradient>
      </defs>
      <rect width="1122" height="793" fill="url(#guillochePattern)" />
    </svg>

    <!-- Web App Logo Watermark in Background -->
    <div class="cert-watermark-container">
      <img src="/evalix-logo.png" alt="Evalix Logo Watermark" class="cert-watermark-img" />
    </div>

    <!-- Top Wave Header SVG: Deep Navy (#0B1F3A) + Sweeping Gold Curve + Thin Neon Accents -->
    <svg class="cert-header-wave-svg" viewBox="0 0 1122 195" preserveAspectRatio="none">
      <!-- Upper Right Sweeping Gold Metallic Curve -->
      <path d="M 660,0 Q 850,52 970,18 Q 1050,-8 1122,52 L 1122,0 Z" fill="url(#goldCurveGrad)" />
      <path d="M 750,0 Q 910,58 1030,28 Q 1080,16 1122,62 L 1122,0 Z" fill="#F5D77A" opacity="0.35" />

      <!-- Deep Navy Blue (#0B1F3A) Wave-shaped Header at Top and Left -->
      <path d="M 0,0 L 710,0 C 625,52 545,98 440,110 C 310,125 170,92 0,195 Z" fill="#0B1F3A" />

      <!-- Thin Neon Accents along wave edge: violet (#7C3AED), pink (#EC4899), cyan (#22D3EE) -->
      <path d="M 0,193 C 170,90 310,123 440,108 C 545,96 625,50 710,0" fill="none" stroke="#7C3AED" stroke-width="2.6" />
      <path d="M 0,195 C 170,92 310,125 440,110 C 545,98 625,52 712,0" fill="none" stroke="#EC4899" stroke-width="1.8" opacity="0.9" />
      <path d="M 0,197 C 170,94 310,127 440,112 C 545,100 625,54 714,0" fill="none" stroke="#22D3EE" stroke-width="1.4" opacity="0.85" />
    </svg>

    <!-- Top-Left Header Content (on navy header) -->
    <div class="cert-top-left-header">
      <!-- Empty clean rectangular space reserved for Evalix 2.0 logo (leave blank) -->
      <div class="cert-logo-reserved-box" title="Reserved for Evalix 2.0 Logo"></div>

      <!-- In gold serif small-caps: CERTIFICATE OF EVALUATION -->
      <div class="cert-gold-serif-title">CERTIFICATE OF EVALUATION</div>

      <!-- Under it in white: Bloom's Taxonomy Educational Domain Analysis -->
      <div class="cert-white-domain-subtitle">Bloom's Taxonomy Educational Domain Analysis</div>
    </div>

    <!-- Left Side: Vertical Navy Ribbon with round gold seal badge reading VERIFIED / EVALIX 2.0, with two gold tails -->
    <div class="cert-vertical-ribbon">
      <div class="cert-ribbon-stripe"></div>
      <div class="cert-seal-assembly">
        <div class="cert-round-gold-badge">
          <div class="seal-ring-emboss">
            <span class="seal-text-top">VERIFIED</span>
            <div class="seal-gold-star">✦</div>
            <span class="seal-text-bottom">EVALIX 2.0</span>
          </div>
        </div>
        <!-- Two gold ribbon tails -->
        <div class="cert-gold-tails">
          <div class="tail-strip tail-l"></div>
          <div class="tail-strip tail-r"></div>
        </div>
      </div>
    </div>

    <!-- Certificate Main Body Content -->
    <div class="cert-body-layout">
      <!-- Right-centre text, right-aligned: "This certificate is proudly presented to" -->
      <div class="cert-presented-row">
        <span class="presented-phrase">This certificate is proudly presented to</span>
      </div>

      <!-- Student name in large, elegant flowing CURSIVE calligraphy script, dark navy, on a thin black underline -->
      <div class="cert-student-block">
        <div class="cert-student-cursive-name">${cert.recipientName}</div>
        <div class="cert-student-underline"></div>
      </div>

      <!-- "for the successful evaluation of the report titled" then report title in smaller flowing cursive calligraphy -->
      <div class="cert-report-block">
        <div class="cert-report-caption">for the successful evaluation of the report titled</div>
        <div class="cert-report-cursive-title">${cert.documentTitle}</div>
      </div>

      <!-- A row of four clean rounded stat boxes -->
      <div class="cert-four-stats-grid">
        <div class="stat-pill-box box-cognitive">
          <span class="pill-title">Cognitive:</span>
          <span class="pill-data">${cert.cognitiveCount} verbs (${cert.cognitivePct}%)</span>
        </div>
        <div class="stat-pill-box box-affective">
          <span class="pill-title">Affective:</span>
          <span class="pill-data">${cert.affectiveCount} verbs (${cert.affectivePct}%)</span>
        </div>
        <div class="stat-pill-box box-psychomotor">
          <span class="pill-title">Psychomotor:</span>
          <span class="pill-data">${cert.psychomotorCount} verbs (${cert.psychomotorPct}%)</span>
        </div>
        <div class="stat-pill-box box-quality">
          <span class="pill-title">Quality Score:</span>
          <span class="pill-data">${cert.overallScore} / 100 – Grade [${cert.gradeBand}]</span>
        </div>
      </div>

      <!-- Small single line of details -->
      <div class="cert-single-details-line">
        <span>Total Verbs: [${cert.totalVerbs}]</span>
        <span class="dot-sep">|</span>
        <span>Unique Verbs: [${cert.uniqueVerbs}]</span>
        <span class="dot-sep">|</span>
        <span>Evaluated on: [${cert.evaluatedAt}]</span>
        <span class="dot-sep">|</span>
        <span>Certificate ID: [${cert.certificateId}]</span>
      </div>

      <!-- A short sentence -->
      <p class="cert-blooms-description">
        This report was analysed using Bloom's Taxonomy across the cognitive, affective and psychomotor domains.
      </p>

      <!-- Bottom triad: Faculty Signature (left), Report Type Badge (center), QR Code (right) -->
      <div class="cert-bottom-triad">
        <!-- Bottom left: Faculty / Guide Signature -->
        <div class="cert-signature-col">
          <div class="sig-handwritten-text">Faculty Guide</div>
          <div class="sig-rule-line"></div>
          <div class="sig-label-text">Faculty / Guide Signature</div>
        </div>

        <!-- Bottom centre: Bold gold-outlined navy badge with white text -->
        <div class="cert-center-badge-col">
          <div class="cert-report-type-gold-badge">
            REPORT TYPE: [${cert.reportType}]
          </div>
        </div>

        <!-- Bottom right: REAL SCANNABLE QR CODE, caption "Scan to verify" -->
        <div class="cert-qr-col">
          <div class="cert-qr-reserved-square" title="Scannable Verification QR Code">
            ${qrMarkup}
          </div>
          <div class="qr-caption-text">Scan to verify</div>
        </div>
      </div>
    </div>
  </div>

  ${autoPrint ? `
  <script>
    window.onload = function() {
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

// server/utils/certificateGenerator.js
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

/**
 * Format date nicely (e.g. "October 11, 2026")
 */
const formatDate = (isoString) => {
    try {
        const d = isoString ? new Date(isoString) : new Date();
        if (isNaN(d.getTime())) return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch {
        return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
};

/**
 * Sanitize text strings for PDF display (remove control chars, normalize spaces)
 */
const sanitizeText = (str, maxLen = 120) => {
    if (!str) return '';
    const cleaned = String(str)
        .replace(/[\r\n\t]+/g, ' ')
        .replace(/[^\x20-\x7E\xA0-\xFF]/g, '')
        .trim();
    if (cleaned.length > maxLen) {
        return cleaned.substring(0, maxLen - 3) + '...';
    }
    return cleaned;
};

/**
 * Generate Certificate PDF using PDFKit
 * Returns a Promise that resolves with a Buffer
 */
const generateCertificatePdfBuffer = (certData) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                layout: 'landscape',
                size: 'A4', // 841.89 x 595.28 points
                margins: { top: 0, bottom: 0, left: 0, right: 0 },
                info: {
                    Title: `Evalix Certificate - ${certData.recipientName || 'Evaluation'}`,
                    Author: 'Evalix 2.0',
                    Subject: 'Certificate of Evaluation',
                    Keywords: 'Evalix, Bloom Taxonomy, Certificate, Education'
                }
            });

            const buffers = [];
            doc.on('data', chunk => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', err => reject(err));

            const PAGE_W = 841.89;
            const PAGE_H = 595.28;

            // -------------------------------------------------------------
            // 1. BACKGROUND
            // -------------------------------------------------------------
            doc.rect(0, 0, PAGE_W, PAGE_H).fill('#FFFFFF');

            // -------------------------------------------------------------
            // 2. GEOMETRIC ACCENTS (TOP-LEFT CORNER)
            // -------------------------------------------------------------
            // Facet 1: Deep Navy
            doc.polygon([0, 0], [175, 0], [95, 140], [0, 80]).fill('#0F172A');
            // Facet 2: Royal Blue
            doc.polygon([0, 80], [95, 140], [40, 210], [0, 195]).fill('#1E3A8A');
            // Facet 3: Cobalt Blue
            doc.polygon([175, 0], [240, 0], [130, 120], [95, 140]).fill('#2563EB');
            // Facet 4: Vibrant Cyan/Blue
            doc.polygon([130, 120], [165, 80], [105, 170], [40, 210]).fill('#38BDF8');
            // Facet 5: Soft Accent
            doc.polygon([0, 195], [40, 210], [15, 245], [0, 235]).fill('#60A5FA');

            // -------------------------------------------------------------
            // 3. GEOMETRIC ACCENTS (BOTTOM-RIGHT CORNER)
            // -------------------------------------------------------------
            // Facet 1: Deep Navy
            doc.polygon([PAGE_W, PAGE_H], [PAGE_W - 175, PAGE_H], [PAGE_W - 95, PAGE_H - 140], [PAGE_W, PAGE_H - 80]).fill('#0F172A');
            // Facet 2: Royal Navy
            doc.polygon([PAGE_W, PAGE_H - 80], [PAGE_W - 95, PAGE_H - 140], [PAGE_W - 40, PAGE_H - 210], [PAGE_W, PAGE_H - 195]).fill('#1E3A8A');
            // Facet 3: Cobalt Blue
            doc.polygon([PAGE_W - 175, PAGE_H], [PAGE_W - 240, PAGE_H], [PAGE_W - 130, PAGE_H - 120], [PAGE_W - 95, PAGE_H - 140]).fill('#2563EB');
            // Facet 4: Cyan accent
            doc.polygon([PAGE_W - 130, PAGE_H - 120], [PAGE_W - 165, PAGE_H - 80], [PAGE_W - 105, PAGE_H - 170], [PAGE_W - 40, PAGE_H - 210]).fill('#38BDF8');
            // Facet 5: Soft Blue
            doc.polygon([PAGE_W, PAGE_H - 195], [PAGE_W - 40, PAGE_H - 210], [PAGE_W - 15, PAGE_H - 245], [PAGE_W, PAGE_H - 235]).fill('#60A5FA');

            // -------------------------------------------------------------
            // 4. ELEGANT BORDER FRAME
            // -------------------------------------------------------------
            const FRAME_X = 36;
            const FRAME_Y = 28;
            const FRAME_W = PAGE_W - 72;
            const FRAME_H = PAGE_H - 56;

            // Outer Frame
            doc.rect(FRAME_X, FRAME_Y, FRAME_W, FRAME_H)
               .lineWidth(1.5)
               .stroke('#1E3A8A');

            // Inner Thin Frame
            doc.rect(FRAME_X + 6, FRAME_Y + 6, FRAME_W - 12, FRAME_H - 12)
               .lineWidth(0.5)
               .stroke('#94A3B8');

            // Corner Accents (Gold/Amber square pips)
            const corners = [
                [FRAME_X + 6, FRAME_Y + 6],
                [FRAME_X + FRAME_W - 6, FRAME_Y + 6],
                [FRAME_X + 6, FRAME_Y + FRAME_H - 6],
                [FRAME_X + FRAME_W - 6, FRAME_Y + FRAME_H - 6]
            ];
            corners.forEach(([cx, cy]) => {
                doc.rect(cx - 3, cy - 3, 6, 6).fill('#D97706');
            });

            // -------------------------------------------------------------
            // 5. TOP BRANDING & LOGO BADGE (RIGHT SIDE)
            // -------------------------------------------------------------
            // Seal Badge (top right inside frame)
            const SEAL_X = PAGE_W - 105;
            const SEAL_Y = 62;
            doc.circle(SEAL_X, SEAL_Y, 26).lineWidth(2).stroke('#1E3A8A');
            doc.circle(SEAL_X, SEAL_Y, 23).lineWidth(0.75).stroke('#D97706');
            doc.circle(SEAL_X, SEAL_Y, 20).fill('#EFF6FF');
            doc.fontSize(7).font('Helvetica-Bold').fillColor('#1E3A8A')
               .text('EVALIX', SEAL_X - 18, SEAL_Y - 9, { width: 36, align: 'center' });
            doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#2563EB')
               .text('2.0', SEAL_X - 18, SEAL_Y + 1, { width: 36, align: 'center' });

            // -------------------------------------------------------------
            // 6. HEADER & TITLE
            // -------------------------------------------------------------
            // Eyebrow
            doc.fontSize(9).font('Helvetica-Bold').fillColor('#2563EB')
               .text('EVALIX 2.0 • BLOOM\'S TAXONOMY EDUCATIONAL ANALYTICS', 0, 48, {
                   align: 'center',
                   characterSpacing: 1.5
               });

            // Main Title
            doc.fontSize(28).font('Helvetica-Bold').fillColor('#0F172A')
               .text('CERTIFICATE OF EVALUATION', 0, 66, {
                   align: 'center',
                   characterSpacing: 2
               });

            // Subtitle
            doc.fontSize(10.5).font('Helvetica').fillColor('#64748B')
               .text('DOCUMENT ANALYSIS & PEDAGOGICAL DOMAIN VERIFICATION', 0, 102, {
                   align: 'center',
                   characterSpacing: 1
               });

            // Decorative Divider Line with Diamond Center
            const lineY = 120;
            doc.moveTo(270, lineY).lineTo(395, lineY).lineWidth(1).stroke('#CBD5E1');
            doc.moveTo(445, lineY).lineTo(570, lineY).lineWidth(1).stroke('#CBD5E1');
            // Center diamond
            doc.polygon([420, lineY - 5], [426, lineY], [420, lineY + 5], [414, lineY]).fill('#D97706');

            // -------------------------------------------------------------
            // 7. RECIPIENT SECTION
            // -------------------------------------------------------------
            doc.fontSize(11.5).font('Times-Italic').fillColor('#475569')
               .text('This certificate acknowledges that', 0, 134, { align: 'center' });

            // Recipient Full Name
            const recipientName = sanitizeText(certData.recipientName || 'Recipient Name', 60);
            doc.fontSize(25).font('Helvetica-Bold').fillColor('#1E3A8A')
               .text(recipientName, 0, 154, { align: 'center' });

            // Recipient Underline
            const nameWidth = Math.min(Math.max(doc.widthOfString(recipientName) + 40, 180), 500);
            const underlineX = (PAGE_W - nameWidth) / 2;
            doc.moveTo(underlineX, 185).lineTo(underlineX + nameWidth, 185).lineWidth(1.2).stroke('#2563EB');

            // Explanatory Statement
            doc.fontSize(10).font('Helvetica').fillColor('#334155')
               .text(
                   'has successfully completed a comprehensive document evaluation using Evalix 2.0. The submitted work underwent multi-domain Bloom\'s Taxonomy analysis, quantifying action verb concentrations across cognitive, affective, and psychomotor dimensions.',
                   120,
                   197,
                   {
                       width: PAGE_W - 240,
                       align: 'center',
                       lineGap: 3.5
                   }
               );

            // -------------------------------------------------------------
            // 8. DOCUMENT TITLE BADGE / CONTAINER
            // -------------------------------------------------------------
            const docBadgeY = 246;
            const docBadgeW = 580;
            const docBadgeH = 30;
            const docBadgeX = (PAGE_W - docBadgeW) / 2;

            doc.roundedRect(docBadgeX, docBadgeY, docBadgeW, docBadgeH, 5)
               .fillAndStroke('#F8FAFC', '#E2E8F0');

            const docTitle = sanitizeText(certData.documentTitle || 'Evaluated Document', 80);
            doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#475569')
               .text('EVALUATED DOCUMENT: ', docBadgeX + 16, docBadgeY + 9, { continued: true })
               .font('Helvetica-Bold').fillColor('#0F172A')
               .text(docTitle);

            // -------------------------------------------------------------
            // 9. BLOOM'S TAXONOMY & EVALUATION METRICS BREAKDOWN
            // -------------------------------------------------------------
            const metrics = certData.metrics || {};
            const qualityScore = certData.qualityScore || null;

            const CARDS_Y = 288;
            const CARD_H = 82;
            const CARD_W = 158;
            const GAP = 12;
            const TOTAL_CARDS_W = (CARD_W * 4) + (GAP * 3);
            const START_X = (PAGE_W - TOTAL_CARDS_W) / 2;

            // Card 1: Cognitive Domain
            const cCount = metrics.cognitive?.count || 0;
            const cPct = metrics.cognitive?.percentage !== undefined ? metrics.cognitive.percentage : 0;
            doc.roundedRect(START_X, CARDS_Y, CARD_W, CARD_H, 6)
               .fillAndStroke('#F5F3FF', '#DDD6FE');
            doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#7C3AED')
               .text('COGNITIVE DOMAIN', START_X + 10, CARDS_Y + 10);
            doc.fontSize(16).font('Helvetica-Bold').fillColor('#5B21B6')
               .text(`${cCount} Verbs`, START_X + 10, CARDS_Y + 25);
            doc.fontSize(9).font('Helvetica').fillColor('#6D28D9')
               .text(`${cPct}% of Classified Verbs`, START_X + 10, CARDS_Y + 46);
            doc.fontSize(7.5).font('Helvetica').fillColor('#8B5CF6')
               .text('Remember → Create Spectrum', START_X + 10, CARDS_Y + 62);

            // Card 2: Affective Domain
            const aCount = metrics.affective?.count || 0;
            const aPct = metrics.affective?.percentage !== undefined ? metrics.affective.percentage : 0;
            const card2X = START_X + CARD_W + GAP;
            doc.roundedRect(card2X, CARDS_Y, CARD_W, CARD_H, 6)
               .fillAndStroke('#FDF2F8', '#FBCFE8');
            doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#DB2777')
               .text('AFFECTIVE DOMAIN', card2X + 10, CARDS_Y + 10);
            doc.fontSize(16).font('Helvetica-Bold').fillColor('#9D174D')
               .text(`${aCount} Verbs`, card2X + 10, CARDS_Y + 25);
            doc.fontSize(9).font('Helvetica').fillColor('#BE185D')
               .text(`${aPct}% of Classified Verbs`, card2X + 10, CARDS_Y + 46);
            doc.fontSize(7.5).font('Helvetica').fillColor('#EC4899')
               .text('Receiving → Characterizing', card2X + 10, CARDS_Y + 62);

            // Card 3: Psychomotor Domain
            const pCount = metrics.psychomotor?.count || 0;
            const pPct = metrics.psychomotor?.percentage !== undefined ? metrics.psychomotor.percentage : 0;
            const card3X = card2X + CARD_W + GAP;
            doc.roundedRect(card3X, CARDS_Y, CARD_W, CARD_H, 6)
               .fillAndStroke('#ECFEFF', '#A5F3FC');
            doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#0891B2')
               .text('PSYCHOMOTOR DOMAIN', card3X + 10, CARDS_Y + 10);
            doc.fontSize(16).font('Helvetica-Bold').fillColor('#155E75')
               .text(`${pCount} Verbs`, card3X + 10, CARDS_Y + 25);
            doc.fontSize(9).font('Helvetica').fillColor('#0E7490')
               .text(`${pPct}% of Classified Verbs`, card3X + 10, CARDS_Y + 46);
            doc.fontSize(7.5).font('Helvetica').fillColor('#06B6D4')
               .text('Perception → Origination', card3X + 10, CARDS_Y + 62);

            // Card 4: Quality Score or Total Verb Audit
            const card4X = card3X + CARD_W + GAP;
            if (qualityScore && qualityScore.overallScore !== undefined) {
                doc.roundedRect(card4X, CARDS_Y, CARD_W, CARD_H, 6)
                   .fillAndStroke('#F0FDF4', '#BBF7D0');
                doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#16A34A')
                   .text('QUALITY AUDIT SCORE', card4X + 10, CARDS_Y + 10);
                doc.fontSize(16).font('Helvetica-Bold').fillColor('#15803D')
                   .text(`${qualityScore.overallScore}/100`, card4X + 10, CARDS_Y + 25);
                doc.fontSize(9).font('Helvetica').fillColor('#166534')
                   .text(`Grade Band: ${qualityScore.gradeBand || 'A'} (${qualityScore.grade || 'Verified'})`, card4X + 10, CARDS_Y + 46);
                doc.fontSize(7.5).font('Helvetica').fillColor('#22C55E')
                   .text(sanitizeText(qualityScore.documentType || 'Quality Assessment', 24), card4X + 10, CARDS_Y + 62);
            } else {
                const totalVerbs = metrics.totalVerbs || (cCount + aCount + pCount);
                doc.roundedRect(card4X, CARDS_Y, CARD_W, CARD_H, 6)
                   .fillAndStroke('#F8FAFC', '#E2E8F0');
                doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#475569')
                   .text('ANALYSIS SCOPE', card4X + 10, CARDS_Y + 10);
                doc.fontSize(16).font('Helvetica-Bold').fillColor('#0F172A')
                   .text(`${totalVerbs} Verbs`, card4X + 10, CARDS_Y + 25);
                doc.fontSize(9).font('Helvetica').fillColor('#334155')
                   .text('Complete Lexical Audit', card4X + 10, CARDS_Y + 46);
                doc.fontSize(7.5).font('Helvetica').fillColor('#64748B')
                   .text('3 Taxonomy Dimensions', card4X + 10, CARDS_Y + 62);
            }

            // -------------------------------------------------------------
            // 10. VERIFICATION & METADATA FOOTER BLOCK
            // -------------------------------------------------------------
            const META_Y = 398;
            const issueDate = formatDate(certData.issuedAt || certData.evaluationDate);
            const certId = certData.certificateId || 'EVX-2026-UNKNOWN';

            // Left: Completion Date
            doc.fontSize(8.5).font('Helvetica').fillColor('#64748B')
               .text('COMPLETED:', 120, META_Y);
            doc.fontSize(11).font('Helvetica-Bold').fillColor('#0F172A')
               .text(issueDate, 120, META_Y + 14);

            // Center: Verification Seal / System
            doc.fontSize(8.5).font('Helvetica').fillColor('#64748B')
               .text('VERIFICATION STATUS:', 330, META_Y, { align: 'center', width: 180 });
            doc.fontSize(10.5).font('Helvetica-Bold').fillColor('#1E3A8A')
               .text('AUTOMATED AUDIT VERIFIED', 330, META_Y + 14, { align: 'center', width: 180 });
            doc.fontSize(7.5).font('Helvetica').fillColor('#2563EB')
               .text('Evalix 2.0 Evaluation Engine', 330, META_Y + 30, { align: 'center', width: 180 });

            // Right: Unique Certificate ID
            doc.fontSize(8.5).font('Helvetica').fillColor('#64748B')
               .text('CERTIFICATE ID:', PAGE_W - 270, META_Y, { align: 'right', width: 150 });
            doc.fontSize(11).font('Helvetica-Bold').fillColor('#1E3A8A')
               .text(certId, PAGE_W - 270, META_Y + 14, { align: 'right', width: 150 });

            // Subtle divider line above disclaimer
            doc.moveTo(120, 465).lineTo(PAGE_W - 120, 465).lineWidth(0.5).stroke('#E2E8F0');

            // -------------------------------------------------------------
            // 11. DISCLAIMER FOOTER
            // -------------------------------------------------------------
            doc.fontSize(7.5).font('Helvetica').fillColor('#94A3B8')
               .text(
                   'Generated by Evalix 2.0 (Bloom\'s Taxonomy Educational Analysis System). This certificate validates algorithmic document evaluation completion and is not an accredited institutional qualification.',
                   110,
                   480,
                   {
                       width: PAGE_W - 220,
                       align: 'center',
                       lineGap: 2
                   }
               );

            // End document
            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = {
    generateCertificatePdfBuffer,
    formatDate,
    sanitizeText
};

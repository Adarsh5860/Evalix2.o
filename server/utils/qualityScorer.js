// utils/qualityScorer.js
/**
 * Quality Scorer for Evalix 2.0
 * Evaluates document quality based on document type requirements:
 * 1. Structural Completeness Score (0-100)
 * 2. Bloom's Taxonomy Level Alignment Score (0-100)
 * 3. Overall Quality Score (weighted average) & Grade Band
 */

// Configurable weights for overall score calculation
const WEIGHT_STRUCTURAL = 0.5;
const WEIGHT_BLOOMS = 0.5;

// Document Type Definitions: Required sections and expected Bloom's distribution
const DOCUMENT_TYPE_PROFILES = {
    'Mini Project Report': {
        name: 'Mini Project Report',
        requiredSections: [
            { id: 'abstract', name: 'Abstract', patterns: [/abstract/i, /executive\s+summary/i, /synopsis/i] },
            { id: 'objective', name: 'Objective', patterns: [/objective[s]?/i, /aim[s]?/i, /purpose/i, /scope\s+of\s+work/i] },
            { id: 'methodology', name: 'Methodology', patterns: [/methodology/i, /method[s]?/i, /approach/i, /proposed\s+work/i, /proposed\s+system/i] },
            { id: 'implementation', name: 'Implementation', patterns: [/implementation/i, /development/i, /execution/i, /system\s+implementation/i, /coding/i] },
            { id: 'results', name: 'Result/Output', patterns: [/result[s]?/i, /output[s]?/i, /finding[s]?/i, /experimental\s+result[s]?/i, /screenshot[s]?/i] },
            { id: 'conclusion', name: 'Conclusion', patterns: [/conclusion[s]?/i, /concluding\s+remark[s]?/i, /summary\s+and\s+conclusion/i] }
        ],
        // Expected cognitive emphasis: mostly Apply / Analyze, lower for Evaluate / Create
        expectedDistribution: {
            remember: 0.15,
            understand: 0.20,
            apply: 0.35,
            analyze: 0.20,
            evaluate: 0.05,
            create: 0.05
        },
        description: 'Emphasizes practical execution and analysis of targeted project objectives.'
    },

    'Project Report': {
        name: 'Project Report',
        requiredSections: [
            { id: 'abstract', name: 'Abstract', patterns: [/abstract/i, /executive\s+summary/i, /synopsis/i] },
            { id: 'introduction', name: 'Introduction', patterns: [/introduction/i, /background/i, /project\s+overview/i] },
            { id: 'literature_review', name: 'Literature Review', patterns: [/literature\s+review/i, /related\s+work[s]?/i, /background\s+study/i, /survey/i] },
            { id: 'methodology', name: 'Methodology', patterns: [/methodology/i, /proposed\s+methodology/i, /system\s+architecture/i, /proposed\s+system/i] },
            { id: 'system_design', name: 'System Design', patterns: [/system\s+design/i, /design/i, /architecture/i, /data\s+flow/i, /uml/i] },
            { id: 'implementation', name: 'Implementation', patterns: [/implementation/i, /development/i, /system\s+construction/i] },
            { id: 'testing', name: 'Testing', patterns: [/testing/i, /validation/i, /verification/i, /test\s+case[s]?/i, /quality\s+assurance/i] },
            { id: 'results', name: 'Results', patterns: [/result[s]?/i, /result[s]?\s+and\s+discussion/i, /performance\s+analysis/i, /output[s]?/i] },
            { id: 'conclusion', name: 'Conclusion', patterns: [/conclusion[s]?/i, /concluding\s+remark[s]?/i, /conclusion\s+and\s+future\s+scope/i, /future\s+work/i] },
            { id: 'references', name: 'References', patterns: [/reference[s]?/i, /bibliography/i, /works\s+cited/i] }
        ],
        // Expected cognitive emphasis: Apply, Analyze, Evaluate — some Create
        expectedDistribution: {
            remember: 0.10,
            understand: 0.15,
            apply: 0.25,
            analyze: 0.25,
            evaluate: 0.15,
            create: 0.10
        },
        description: 'Comprehensive engineering / scientific project documentation across all SDLC phases.'
    },

    'Dissertation': {
        name: 'Dissertation',
        requiredSections: [
            { id: 'abstract', name: 'Abstract', patterns: [/abstract/i, /executive\s+summary/i] },
            { id: 'introduction', name: 'Introduction', patterns: [/introduction/i, /background\s+of\s+the\s+study/i, /motivation/i] },
            { id: 'literature_review', name: 'Literature Review', patterns: [/literature\s+review/i, /theoretical\s+background/i, /related\s+work[s]?/i, /literature\s+survey/i] },
            { id: 'research_questions', name: 'Research Questions/Hypothesis', patterns: [/research\s+question[s]?/i, /hypothes[ie]s/i, /problem\s+formulation/i, /research\s+objective[s]?/i, /problem\s+statement/i] },
            { id: 'methodology', name: 'Methodology', patterns: [/methodology/i, /research\s+methodology/i, /research\s+design/i, /theoretical\s+framework/i] },
            { id: 'data_analysis', name: 'Data Analysis', patterns: [/data\s+analysis/i, /statistical\s+analysis/i, /data\s+processing/i, /evaluation\s+methodology/i] },
            { id: 'findings', name: 'Findings', patterns: [/finding[s]?/i, /empirical\s+finding[s]?/i, /observations/i, /experimental\s+findings/i] },
            { id: 'discussion', name: 'Discussion', patterns: [/discussion/i, /discussion\s+of\s+results/i, /implication[s]?/i, /comparative\s+analysis/i] },
            { id: 'conclusion', name: 'Conclusion', patterns: [/conclusion[s]?/i, /concluding\s+chapter/i, /conclusions\s+and\s+future\s+directions/i] },
            { id: 'references', name: 'References', patterns: [/reference[s]?/i, /bibliography/i, /works\s+cited/i] }
        ],
        // Expected cognitive emphasis: heavy weighting toward Analyze, Evaluate, Create (higher-order Bloom's)
        expectedDistribution: {
            remember: 0.05,
            understand: 0.10,
            apply: 0.15,
            analyze: 0.30,
            evaluate: 0.25,
            create: 0.15
        },
        description: 'Advanced research thesis requiring higher-order cognitive critique, evaluation, and synthesis.'
    },

    'Technical Report': {
        name: 'Technical Report',
        requiredSections: [
            { id: 'abstract', name: 'Abstract/Summary', patterns: [/abstract/i, /executive\s+summary/i, /summary/i, /overview/i] },
            { id: 'problem_statement', name: 'Problem Statement', patterns: [/problem\s+statement/i, /problem\s+description/i, /challenge/i, /background\s+and\s+motivation/i] },
            { id: 'technical_specifications', name: 'Technical Specifications', patterns: [/technical\s+specification[s]?/i, /specification[s]?/i, /system\s+requirement[s]?/i, /technical\s+requirement[s]?/i] },
            { id: 'system_architecture', name: 'System Architecture/Design', patterns: [/system\s+architecture/i, /architecture/i, /system\s+design/i, /block\s+diagram/i] },
            { id: 'implementation_details', name: 'Implementation Details', patterns: [/implementation\s+detail[s]?/i, /implementation/i, /technical\s+implementation/i, /deployment/i] },
            { id: 'testing_validation', name: 'Testing/Validation', patterns: [/testing/i, /validation/i, /verification/i, /benchmark[s]?/i, /performance\s+testing/i] },
            { id: 'results', name: 'Results', patterns: [/result[s]?/i, /experimental\s+result[s]?/i, /benchmark\s+results/i, /performance\s+evaluation/i] },
            { id: 'conclusion', name: 'Conclusion', patterns: [/conclusion[s]?/i, /concluding\s+remark[s]?/i, /recommendations/i] },
            { id: 'references', name: 'References', patterns: [/reference[s]?/i, /bibliography/i, /standard[s]?\s+and\s+citations/i] }
        ],
        // Expected emphasis: Apply, Analyze, plus procedural/psychomotor mechanism operations
        expectedDistribution: {
            remember: 0.10,
            understand: 0.15,
            apply: 0.35,
            analyze: 0.25,
            evaluate: 0.10,
            create: 0.05
        },
        description: 'Detailed specifications, architectural blueprints, procedural operations, and technical validations.'
    }
};

/**
 * Determine qualitative grade band from numeric score
 */
function getGradeBand(score) {
    if (score >= 85) return { grade: 'Excellent', band: 'A', color: '#10B981' };
    if (score >= 70) return { grade: 'Good', band: 'B', color: '#3B82F6' };
    if (score >= 50) return { grade: 'Needs Improvement', band: 'C', color: '#F59E0B' };
    return { grade: 'Poor', band: 'D', color: '#EF4444' };
}

/**
 * Scan document text to detect required sections
 */
function evaluateStructure(extractedText, profile) {
    const text = (extractedText || '').toLowerCase();
    const missingSections = [];
    const detectedSections = [];

    profile.requiredSections.forEach(section => {
        const isFound = section.patterns.some(pattern => pattern.test(text));
        if (isFound) {
            detectedSections.push(section.name);
        } else {
            missingSections.push(section.name);
        }
    });

    const totalRequired = profile.requiredSections.length;
    const foundCount = detectedSections.length;
    const structuralScore = totalRequired > 0 
        ? Math.round((foundCount / totalRequired) * 100) 
        : 100;

    return {
        structuralScore,
        detectedSections,
        missingSections,
        totalRequired,
        foundCount
    };
}

/**
 * Compare actual Bloom's subdomain distribution against expected profile
 */
function evaluateBloomsAlignment(documentType, domainCounts, subdomainCounts) {
    const profile = DOCUMENT_TYPE_PROFILES[documentType] || DOCUMENT_TYPE_PROFILES['Project Report'];
    const expected = profile.expectedDistribution;

    // Aggregate cognitive subdomain counts
    const cognitiveCounts = (domainCounts && domainCounts.cognitive && domainCounts.cognitive.subdomains)
        ? domainCounts.cognitive.subdomains
        : (subdomainCounts || {});

    const levels = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'];
    
    // Calculate total cognitive verbs
    let totalCognitive = 0;
    levels.forEach(level => {
        totalCognitive += (cognitiveCounts[level] || 0);
    });

    // If no cognitive verbs, calculate from domain total if available
    const actualDistribution = {};
    levels.forEach(level => {
        const count = cognitiveCounts[level] || 0;
        actualDistribution[level] = totalCognitive > 0 ? (count / totalCognitive) : 0;
    });

    // If totalCognitive is 0, provide baseline score
    if (totalCognitive === 0) {
        return {
            bloomsAlignmentScore: 50,
            misalignedLevels: ['No cognitive action verbs detected to evaluate Bloom\'s alignment.'],
            actualDistribution,
            expectedDistribution: expected
        };
    }

    // Compute Histogram Intersection (overlap similarity between distributions)
    let overlapSum = 0;
    const misalignedLevels = [];

    levels.forEach(level => {
        const actualFraction = actualDistribution[level] || 0;
        const expectedFraction = expected[level] || 0;
        overlapSum += Math.min(actualFraction, expectedFraction);

        const actualPct = Math.round(actualFraction * 100);
        const expectedPct = Math.round(expectedFraction * 100);
        const diff = actualPct - expectedPct;

        const levelCap = level.charAt(0).toUpperCase() + level.slice(1);
        if (diff <= -12) {
            misalignedLevels.push(`Low ${levelCap} emphasis (${actualPct}% actual vs ${expectedPct}% expected)`);
        } else if (diff >= 18) {
            misalignedLevels.push(`Excessive ${levelCap} concentration (${actualPct}% actual vs ${expectedPct}% expected)`);
        }
    });

    // Baseline alignment score from overlap (0.0 to 1.0 -> 0 to 100)
    let rawScore = Math.round(overlapSum * 100);

    // Document-specific penalties / bonuses:
    // For Dissertation: penalty if low-level verbs (remember + understand) dominate (> 45%)
    if (documentType === 'Dissertation') {
        const lowerOrderShare = (actualDistribution.remember || 0) + (actualDistribution.understand || 0);
        if (lowerOrderShare > 0.45) {
            const excess = Math.round((lowerOrderShare - 0.45) * 50);
            rawScore = Math.max(20, rawScore - excess);
            if (!misalignedLevels.some(m => m.includes('lower-order'))) {
                misalignedLevels.push(`Excessive lower-order verbs (${Math.round(lowerOrderShare * 100)}% Remember/Understand) for a Dissertation`);
            }
        }
    }

    // Clamp score to 0-100
    const bloomsAlignmentScore = Math.min(100, Math.max(0, rawScore));

    return {
        bloomsAlignmentScore,
        misalignedLevels,
        actualDistribution,
        expectedDistribution: expected
    };
}

/**
 * Main Quality Scoring Function
 *
 * @param {string} documentType - 'Mini Project Report' | 'Project Report' | 'Dissertation' | 'Technical Report'
 * @param {string} extractedText - Raw full text extracted from the document
 * @param {object} domainCounts - Verb classification domains object
 * @param {object} subdomainCounts - Subdomain counts mapping (e.g. cognitive subdomains)
 * @returns {object} Quality score metrics, breakdown, and qualitative grade
 */
exports.scoreDocumentQuality = (documentType, extractedText, domainCounts, subdomainCounts) => {
    const selectedType = DOCUMENT_TYPE_PROFILES[documentType] 
        ? documentType 
        : 'Project Report';

    const profile = DOCUMENT_TYPE_PROFILES[selectedType];

    // 1. Structural Completeness Score
    const structureResult = evaluateStructure(extractedText, profile);

    // 2. Bloom's Taxonomy Level Alignment Score
    const bloomsResult = evaluateBloomsAlignment(selectedType, domainCounts, subdomainCounts);

    // 3. Overall Weighted Quality Score
    const overallScore = Math.round(
        (structureResult.structuralScore * WEIGHT_STRUCTURAL) + 
        (bloomsResult.bloomsAlignmentScore * WEIGHT_BLOOMS)
    );

    const gradeInfo = getGradeBand(overallScore);

    return {
        documentType: selectedType,
        structuralScore: structureResult.structuralScore,
        detectedSections: structureResult.detectedSections,
        missingSections: structureResult.missingSections,
        totalRequiredSections: structureResult.totalRequired,
        foundSectionsCount: structureResult.foundCount,
        bloomsAlignmentScore: bloomsResult.bloomsAlignmentScore,
        misalignedLevels: bloomsResult.misalignedLevels,
        actualDistribution: bloomsResult.actualDistribution,
        expectedDistribution: bloomsResult.expectedDistribution,
        overallScore,
        grade: gradeInfo.grade,
        gradeBand: gradeInfo.band,
        gradeColor: gradeInfo.color,
        evaluatedAt: new Date().toISOString()
    };
};

exports.DOCUMENT_TYPE_PROFILES = DOCUMENT_TYPE_PROFILES;
exports.WEIGHT_STRUCTURAL = WEIGHT_STRUCTURAL;
exports.WEIGHT_BLOOMS = WEIGHT_BLOOMS;

const assert = require('assert');
const qualityScorer = require('../utils/qualityScorer');
const verbExtractor = require('../utils/verbExtractor');
const verbClassifier = require('../utils/verbClassifier');

async function runSuite() {
  console.log('=== 1. Testing Quality Scorer Module ===');

  const sampleReportText = `
Abstract
This project evaluates educational objectives through natural language processing.
Introduction
Background of Bloom's Taxonomy and motivation for automated classification.
Literature Review
Related work on pedagogical verb parsing and semantic distance metrics.
Methodology
The proposed system architecture extracts sentences and maps verbs to vectors.
System Design
The pipeline comprises text extraction, POS tagging, and cosine matching modules.
Implementation
Constructed using Node.js, Express, React, and compromise NLP.
Testing
Extensive unit tests and validation against reference corpora were performed.
Results
System achieved high classification accuracy and fast response latency.
Conclusion
In conclusion, Evalix delivers automated quality scoring and verb taxonomy metrics.
References
[1] Bloom, B. S. Taxonomy of Educational Objectives.
[2] Anderson, L. W., et al. A Taxonomy for Learning, Teaching, and Assessing.
`;

  const sampleDomains = {
    cognitive: {
      count: 35,
      subdomains: {
        remember: 1,
        understand: 4,
        apply: 10,
        analyze: 9,
        evaluate: 6,
        create: 5
      }
    },
    affective: { count: 4, subdomains: {} },
    psychomotor: { count: 3, subdomains: {} }
  };

  // Test 4 Document Types
  const types = ['Mini Project Report', 'Project Report', 'Dissertation', 'Technical Report'];
  const scoresByType = {};

  types.forEach(t => {
    const res = qualityScorer.scoreDocumentQuality(t, sampleReportText, sampleDomains);
    scoresByType[t] = res;
    console.log(`- ${t}: Overall=${res.overallScore} (${res.grade}), Structural=${res.structuralScore}%, BloomsAlignment=${res.bloomsAlignmentScore}%`);
    assert(res.overallScore >= 0 && res.overallScore <= 100, 'Score must be 0-100');
    assert(res.grade, 'Must provide grade');
    assert(Array.isArray(res.missingSections), 'Must provide missingSections array');
    assert(Array.isArray(res.misalignedLevels), 'Must provide misalignedLevels array');
  });

  // Verify same document has different scores/feedback per document type
  assert(
    scoresByType['Project Report'].overallScore !== scoresByType['Dissertation'].overallScore ||
    scoresByType['Project Report'].structuralScore !== scoresByType['Dissertation'].structuralScore,
    'Same document must yield different structural/quality profiles for different types'
  );
  assert(
    scoresByType['Dissertation'].missingSections.length > 0,
    'Dissertation must flag missing Research Questions / Data Analysis / Findings'
  );
  console.log('✅ Quality Scorer tests passed successfully.\n');

  console.log('=== 2. Testing Verb Extractor Verified/Unverified Candidates ===');
  const mixedText = 'We will design, evaluate, and analyze architectures. We perform clustering, benchmarking, and processing of models.';
  const extracted = await verbExtractor.extractVerbs(mixedText);
  console.log('Extracted candidates count:', extracted.length);

  const verifiedVerbs = extracted.filter(v => v.verified === true).map(v => v.word);
  const unverifiedVerbs = extracted.filter(v => v.verified === false).map(v => v.word);

  console.log('Verified candidates:', verifiedVerbs);
  console.log('Unverified candidates:', unverifiedVerbs);

  assert(verifiedVerbs.includes('design'), 'design should be verified');
  assert(verifiedVerbs.includes('evaluate'), 'evaluate should be verified');
  assert(verifiedVerbs.includes('analyze'), 'analyze should be verified');
  assert(unverifiedVerbs.length > 0, 'Should have unverified candidates from gerunds/borderline tokens');
  console.log('✅ Verb Extractor verified/unverified tagging passed.\n');

  console.log('=== 3. Testing Verb Classifier Dual Thresholds & Inferences ===');
  console.log(`Thresholds: VERIFIED = ${verbClassifier.SIMILARITY_THRESHOLD_VERIFIED}, UNVERIFIED = ${verbClassifier.SIMILARITY_THRESHOLD_UNVERIFIED}`);
  assert.strictEqual(verbClassifier.SIMILARITY_THRESHOLD_VERIFIED, 0.6);
  assert.strictEqual(verbClassifier.SIMILARITY_THRESHOLD_UNVERIFIED, 0.75);

  const testVerbsForClassification = [
    { word: 'design', frequency: 2, verified: true },      // Exact match -> cognitive.create (1.0)
    { word: 'investigate', frequency: 1, verified: false }, // Cosine ~0.84 -> cognitive.analyze (>= 0.75)
    { word: 'build', frequency: 1, verified: false },       // Cosine ~0.825 -> cognitive.create (>= 0.75)
    { word: 'cluster', frequency: 1, verified: false }      // Cosine ~0.676 -> below 0.75 -> unclassified
  ];

  const classificationRes = await verbClassifier.classifyVerbs(testVerbsForClassification);
  
  console.log('Classification results:');
  classificationRes.verbs.forEach(v => {
    console.log(`- "${v.verb}": verified=${v.verified}, domain=${v.domain}.${v.subdomain}, score=${v.similarityScore?.toFixed(3)}, matchedWith=${v.matchedWith}`);
  });

  const designVerb = classificationRes.verbs.find(v => v.verb === 'design');
  const investigateVerb = classificationRes.verbs.find(v => v.verb === 'investigate');
  const buildVerb = classificationRes.verbs.find(v => v.verb === 'build');
  const clusterVerb = classificationRes.verbs.find(v => v.verb === 'cluster');

  assert.strictEqual(designVerb.verified, true, 'design should have verified: true');
  assert.strictEqual(designVerb.domain, 'cognitive');
  assert.strictEqual(designVerb.subdomain, 'create');

  assert.strictEqual(investigateVerb.verified, false, 'investigate should have verified: false');
  assert(investigateVerb.similarityScore >= 0.75, 'investigate score should be >= 0.75');
  assert.strictEqual(investigateVerb.domain, 'cognitive');
  assert.strictEqual(investigateVerb.subdomain, 'analyze');

  assert.strictEqual(buildVerb.verified, false, 'build should have verified: false');
  assert(buildVerb.similarityScore >= 0.75, 'build score should be >= 0.75');
  assert.strictEqual(buildVerb.domain, 'cognitive');

  assert.strictEqual(clusterVerb.verified, false, 'cluster should have verified: false');
  assert(clusterVerb.similarityScore < 0.75, 'cluster score should be below 0.75 threshold');
  assert.strictEqual(clusterVerb.domain, 'unclassified', 'cluster should be unclassified due to below-threshold similarity');
  assert.strictEqual(clusterVerb.subdomain, 'unknown');

  console.log('✅ Verb Classifier dual-threshold tests passed successfully!');
}

runSuite().catch(err => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});

const nlp = require('compromise');

// Structural / auxiliary verbs that do not represent Bloom's Taxonomy action verbs
const AUXILIARY_VERBS = new Set([
  'be', 'is', 'am', 'are', 'was', 'were', 'been', 'being',
  'have', 'has', 'had', 'having',
  'do', 'does', 'did', 'done', 'doing',
  'will', 'would', 'shall', 'should',
  'may', 'might', 'must', 'can', 'could',
  'get', 'got', 'getting', 'gotten'
]);

// Prepositions and particles to omit if returned as part of a verb phrase stem
const STOP_PARTICLES = new Set([
  'on', 'in', 'at', 'by', 'to', 'for', 'with', 'about', 'of', 'from', 'up', 'down', 'out', 'off', 'over', 'under'
]);

/**
 * Extract verbs from the given text with frequency tracking and confidence verification.
 * 
 * Returns: [{ word, frequency, verified }]
 * - verified: true for high-confidence action verbs identified in sentence context
 * - verified: false for borderline / nominal action candidates (e.g. gerunds) to be evaluated via cosine similarity
 */
exports.extractVerbs = async (text) => {
  try {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return [];
    }

    console.log('Starting contextual verb extraction process...');

    const doc = nlp(text);
    const candidates = {};

    // Process sentence by sentence for contextual POS disambiguation
    doc.sentences().forEach(sentence => {
      // 1. High confidence verb phrases
      const verbPhrases = sentence.verbs().json();

      verbPhrases.forEach(v => {
        // Check if the phrase is a gerund or participle in a noun-like role
        const isGerundOrParticiple = v.terms && v.terms.some(t => 
          t.tags && (t.tags.includes('Gerund') || t.tags.includes('Participle'))
        );

        const rawVerb = v.verb.infinitive || v.verb.root || v.text || '';
        const tokens = rawVerb
          .toLowerCase()
          .replace(/[^a-z\s]/g, ' ')
          .trim()
          .split(/\s+/);

        tokens.forEach(word => {
          if (
            word.length > 1 &&
            /^[a-z]+$/.test(word) &&
            !AUXILIARY_VERBS.has(word) &&
            !STOP_PARTICLES.has(word)
          ) {
            if (!candidates[word]) {
              candidates[word] = { 
                word, 
                frequency: 0, 
                verified: !isGerundOrParticiple 
              };
            }
            candidates[word].frequency += 1;
            // If already confirmed as verified in any sentence, keep verified: true
            if (!isGerundOrParticiple) {
              candidates[word].verified = true;
            }
          }
        });
      });

      // 2. Capture potential borderline / unverified action candidates (e.g. gerunds or verbal nominals)
      sentence.match('#Gerund').forEach(m => {
        const raw = m.text('normal').toLowerCase().replace(/[^a-z]/g, '');
        // Convert gerund to infinitive lemma form (e.g. "benchmarking" -> "benchmark", "clustering" -> "cluster")
        const inf = nlp(raw).verbs().toInfinitive().text() || raw;
        const cleanInf = inf.toLowerCase().replace(/[^a-z]/g, '');

        const targetWord = cleanInf.length > 2 ? cleanInf : raw;

        if (
          targetWord.length > 2 &&
          /^[a-z]+$/.test(targetWord) &&
          !AUXILIARY_VERBS.has(targetWord) &&
          !STOP_PARTICLES.has(targetWord)
        ) {
          if (!candidates[targetWord]) {
            candidates[targetWord] = { 
              word: targetWord, 
              frequency: 1, 
              verified: false 
            };
          } else if (candidates[targetWord].verified !== true) {
            // Keep verified: false if not explicitly verified elsewhere
            candidates[targetWord].verified = false;
          }
        }
      });
    });

    const verbsWithFrequency = Object.values(candidates);

    const verifiedCount = verbsWithFrequency.filter(v => v.verified).length;
    const unverifiedCount = verbsWithFrequency.filter(v => !v.verified).length;

    console.log(`Contextual verb extraction complete: found ${verbsWithFrequency.length} unique candidates (${verifiedCount} verified, ${unverifiedCount} unverified)`);
    return verbsWithFrequency;
  } catch (error) {
    console.error('Error extracting verbs:', error);
    throw error;
  }
};
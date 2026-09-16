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
 * Extract verbs from the given text with frequency tracking using sentence-based contextual POS tagging
 */
exports.extractVerbs = async (text) => {
  try {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return [];
    }

    console.log('Starting contextual verb extraction process...');

    const doc = nlp(text);
    const verbFrequency = {};

    // Process sentence by sentence for contextual POS disambiguation
    doc.sentences().forEach(sentence => {
      const verbPhrases = sentence.verbs().json();

      verbPhrases.forEach(v => {
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
            verbFrequency[word] = (verbFrequency[word] || 0) + 1;
          }
        });
      });
    });

    const verbsWithFrequency = Object.keys(verbFrequency).map(word => ({
      word,
      frequency: verbFrequency[word]
    }));

    console.log(`Contextual verb extraction complete: found ${verbsWithFrequency.length} unique action verbs`);
    return verbsWithFrequency;
  } catch (error) {
    console.error('Error extracting verbs:', error);
    throw error;
  }
};
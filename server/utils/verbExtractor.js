const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const WordPOS = require('wordpos');
const wordpos = new WordPOS();

/**
 * Extract verbs from the given text with frequency tracking
 */
exports.extractVerbs = async (text) => {
  try {
    console.log('Starting verb extraction process...');

    // Tokenize the text
    const tokens = tokenizer.tokenize(text);
    console.log(`Tokenized ${tokens.length} words from text`);

    // Filter out short tokens and non-alphabetic tokens
    const filteredTokens = tokens
      .filter(token => token.length > 1)
      .filter(token => /^[a-zA-Z]+$/.test(token))
      .map(token => token.toLowerCase());

    console.log(`After filtering: ${filteredTokens.length} words remaining`);

    // Track original frequencies before deduplication
    const verbFrequency = {};
    filteredTokens.forEach(token => {
      if (verbFrequency[token]) {
        verbFrequency[token]++;
      } else {
        verbFrequency[token] = 1;
      }
    });

    // Get unique tokens to reduce processing for WordPOS
    const uniqueTokens = [...new Set(filteredTokens)];
    console.log(`${uniqueTokens.length} unique words to analyze`);

    // Identify verbs using WordPOS
    let identifiedVerbs = [];
    try {
      identifiedVerbs = await wordpos.getVerbs(uniqueTokens);
      console.log(`Identified ${identifiedVerbs.length} unique verbs`);
    } catch (error) {
      console.error('Error using WordPOS:', error);
      // Basic fallback: Look for common verb endings
      identifiedVerbs = uniqueTokens.filter(token => {
        return token.endsWith('ing') || token.endsWith('ed') || token.endsWith('s') || token.endsWith('ly');
      });
      console.log(`Fallback method identified ${identifiedVerbs.length} potential verbs`);
    }

    // Create result with verb frequencies
    const verbsWithFrequency = identifiedVerbs.map(verb => ({
      word: verb,
      frequency: verbFrequency[verb] || 0
    }));

    console.log('Verb extraction complete');
    console.log(verbsWithFrequency)
    return verbsWithFrequency;
  } catch (error) {
    console.error('Error extracting verbs:', error);
    throw error;
  }
};
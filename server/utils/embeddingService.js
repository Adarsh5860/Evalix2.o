const axios = require('axios');
const dotenv = require('dotenv');
const { getEmbeddingFromCache, storeEmbeddingInCache } = require('./cacheManager');

dotenv.config();

// Gemini API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Fixed embedding dimension for consistency
const EMBEDDING_DIM = 768;

/**
 * Get an embedding for a word using cache first, then Gemini API, with fallback
 */
exports.getEmbedding = async (text) => {
    if (!text || typeof text !== 'string') {
        console.warn('Invalid text provided to getEmbedding');
        return generateFallbackEmbedding('');
    }

    const normalizedText = text.toLowerCase().trim();

    // Check cache first
    const cachedEmbedding = getEmbeddingFromCache(normalizedText);
    if (cachedEmbedding) {
        // console.log(`Retrieved embedding for "${normalizedText}" from cache`);
        return cachedEmbedding;
    }

    // If not in cache, generate embedding
    let embedding;

    if (GEMINI_API_KEY) {
        try {
            // console.log(`Requesting embedding for "${normalizedText}" from Gemini API`);
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1/models/embedding-001:embedContent?key=${GEMINI_API_KEY}`,
                {
                    content: { parts: [{ text: normalizedText }] }
                },
                {
                    timeout: 5000, // 5 second timeout
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data && response.data.embedding && Array.isArray(response.data.embedding.values)) {
                embedding = response.data.embedding.values;
                // console.log(`Received embedding for "${normalizedText}" from API`);
            } else {
                // console.warn(`Unexpected API response format for "${normalizedText}"`);
                embedding = generateFallbackEmbedding(normalizedText);
            }
        } catch (error) {
            console.error(`Error getting embedding for "${normalizedText}" from Gemini API:`, error.message);
            embedding = generateFallbackEmbedding(normalizedText);
        }
    } else {
        console.warn('No Gemini API key found, using fallback embedding method');
        embedding = generateFallbackEmbedding(normalizedText);
    }

    // Store in cache for future use
    storeEmbeddingInCache(normalizedText, embedding);

    return embedding;
};

/**
 * Enhanced fallback embedding function with consistent dimensions
 */
function generateFallbackEmbedding(text) {
    // Create a seed from the text
    let seed = 0;
    for (let i = 0; i < text.length; i++) {
        seed = ((seed << 5) - seed) + text.charCodeAt(i);
        seed = seed & seed; // Convert to 32bit integer
    }

    // First generate character frequency features
    const chars = text.toLowerCase().split('');
    const charFreq = new Array(26).fill(0);

    for (const char of chars) {
        const code = char.charCodeAt(0) - 97; // 'a' is 97
        if (code >= 0 && code < 26) {
            charFreq[code]++;
        }
    }

    // Normalize character frequencies
    const sum = charFreq.reduce((a, b) => a + b, 0) || 1;
    const normalizedFreq = charFreq.map(v => v / sum);

    // Create embedding with consistent dimensions
    const embedding = new Array(EMBEDDING_DIM).fill(0);

    // Copy character frequencies to the first 26 dimensions
    for (let i = 0; i < Math.min(26, embedding.length); i++) {
        embedding[i] = normalizedFreq[i];
    }

    // Fill remaining dimensions with deterministic values based on word
    for (let i = 26; i < embedding.length; i++) {
        seed = (seed * 9301 + 49297) % 233280;
        embedding[i] = seed / 233280;
    }

    // Final normalization
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0)) || 1;
    return embedding.map(v => v / magnitude);
}
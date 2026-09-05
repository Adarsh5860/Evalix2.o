const cosineSimilarity = require('compute-cosine-similarity');
const { getEmbedding } = require('./embeddingService');
const { persistCache } = require('./cacheManager');

// Define taxonomy structure - domains and subdomains with sample verbs
const taxonomy = {
    cognitive: {
        remember: ['recall', 'recognize', 'identify', 'retrieve', 'name', 'list', 'define', 'match', 'memorize'],
        understand: ['explain', 'interpret', 'summarize', 'infer', 'paraphrase', 'classify', 'compare', 'exemplify'],
        apply: ['implement', 'execute', 'use', 'apply', 'demonstrate', 'solve', 'illustrate', 'calculate'],
        analyze: ['analyze', 'differentiate', 'organize', 'attribute', 'compare', 'contrast', 'distinguish', 'examine'],
        evaluate: ['evaluate', 'check', 'critique', 'judge', 'test', 'monitor', 'assess', 'appraise'],
        create: ['generate', 'plan', 'produce', 'design', 'construct', 'create', 'invent', 'develop']
    },
    affective: {
        receiving: ['acknowledge', 'listen', 'notice', 'attend', 'perceive', 'focus', 'recognize', 'be aware'],
        responding: ['respond', 'react', 'follow', 'comply', 'participate', 'volunteer', 'engage', 'contribute'],
        valuing: ['value', 'appreciate', 'accept', 'prefer', 'commit', 'pursue', 'seek', 'desire'],
        organizing: ['organize', 'systematize', 'prioritize', 'relate', 'reconcile', 'integrate', 'balance', 'harmonize'],
        characterizing: ['internalize', 'adopt', 'embody', 'exemplify', 'represent', 'act', 'practice', 'personify']
    },
    psychomotor: {
        perception: ['detect', 'observe', 'perceive', 'recognize', 'sense', 'identify', 'select', 'distinguish'],
        set: ['prepare', 'position', 'organize', 'ready', 'adjust', 'arrange', 'establish', 'get set'],
        guidedResponse: ['imitate', 'follow', 'try', 'reproduce', 'practice', 'attempt', 'repeat', 'emulate'],
        mechanism: ['perform', 'execute', 'implement', 'operate', 'utilize', 'manipulate', 'control', 'coordinate'],
        complexResponse: ['adapt', 'modify', 'improve', 'perfect', 'calibrate', 'refine', 'enhance', 'master'],
        adaptation: ['alter', 'adjust', 'revise', 'vary', 'reorganize', 'change', 'customize', 'tailor'],
        origination: ['create', 'design', 'originate', 'construct', 'compose', 'arrange', 'devise', 'invent']
    }
};

// In-memory cache for embeddings during current session
const sessionEmbeddingCache = {};

/**
 * Get cached embedding or compute new one
 */
const getWordEmbedding = async (word) => {
    if (!word || typeof word !== 'string') {
        console.warn('Invalid word provided to getWordEmbedding');
        return null;
    }

    const normalizedWord = word.toLowerCase().trim();

    if (sessionEmbeddingCache[normalizedWord]) {
        return sessionEmbeddingCache[normalizedWord];
    }

    try {
        const embedding = await getEmbedding(normalizedWord);
        sessionEmbeddingCache[normalizedWord] = embedding;
        return embedding;
    } catch (error) {
        console.error(`Error getting embedding for "${normalizedWord}":`, error);
        return null;
    }
};

/**
 * Find best match for a verb in the taxonomy using semantic similarity
 */
const findBestMatch = async (verb) => {
    if (!verb || typeof verb !== 'string') {
        return { domain: 'unclassified', subdomain: 'unknown', similarity: 0, method: 'error' };
    }

    const normalizedVerb = verb.toLowerCase().trim();

    try {
        console.log(`Finding best match for verb: "${normalizedVerb}"`);

        // Check for direct matches first (fastest approach)
        for (const [domain, subdomains] of Object.entries(taxonomy)) {
            for (const [subdomain, examples] of Object.entries(subdomains)) {
                if (examples.includes(normalizedVerb)) {
                    console.log(`Direct match found for "${normalizedVerb}" in ${domain}.${subdomain}`);
                    return { domain, subdomain, similarity: 1.0, method: 'exact match' };
                }
            }
        }

        // If no direct match, use similarity search
        // console.log(`No direct match for "${normalizedVerb}", using semantic similarity`);
        const verbEmbedding = await getWordEmbedding(normalizedVerb);

        if (!verbEmbedding) {
            console.error(`Failed to get embedding for "${normalizedVerb}"`);
            return { domain: 'unclassified', subdomain: 'unknown', similarity: 0, method: 'error' };
        }

        let bestMatch = { domain: 'unclassified', subdomain: 'unknown', similarity: 0.50, method: 'similarity' };

        for (const [domain, subdomains] of Object.entries(taxonomy)) {
            for (const [subdomain, examples] of Object.entries(subdomains)) {
                for (const example of examples) {
                    try {
                        const exampleEmbedding = await getWordEmbedding(example);

                        if (!exampleEmbedding) {
                            console.warn(`Missing embedding for example "${example}"`);
                            continue;
                        }

                        if (verbEmbedding.length !== exampleEmbedding.length) {
                            // console.warn(`Dimension mismatch: ${normalizedVerb}(${verbEmbedding.length}) vs ${example}(${exampleEmbedding.length})`);
                            continue;
                        }

                        const similarity = cosineSimilarity(verbEmbedding, exampleEmbedding);

                        if (isNaN(similarity)) {
                            console.warn(`Invalid similarity value for ${normalizedVerb} vs ${example}`);
                            continue;
                        }

                        if (similarity > bestMatch.similarity) {
                            bestMatch = {
                                domain,
                                subdomain,
                                similarity,
                                method: 'similarity',
                                matchedWith: example
                            };
                        }
                    } catch (error) {
                        console.error(`Error comparing "${normalizedVerb}" with "${example}":`, error.message);
                    }
                }
            }
        }

        // console.log(`Best match for "${normalizedVerb}": ${bestMatch.domain}.${bestMatch.subdomain} (${bestMatch.similarity.toFixed(2)})`);
        return bestMatch;
    } catch (error) {
        console.error(`Error in findBestMatch for "${normalizedVerb}":`, error);
        return { domain: 'unclassified', subdomain: 'unknown', similarity: 0, method: 'error' };
    }
};

/**
 * Classify a list of verbs into domains and subdomains
 */
exports.classifyVerbs = async (verbsWithFrequency) => {
    console.log(`Starting classification of ${verbsWithFrequency.length} verbs`);

    const results = {
        domains: {
            cognitive: { count: 0, subdomains: {} },
            affective: { count: 0, subdomains: {} },
            psychomotor: { count: 0, subdomains: {} },
            unclassified: { count: 0, subdomains: { unknown: 0 } }
        },
        verbs: [],
        verbsByFrequency: [], // New section with verbs sorted by frequency
        totalVerbCount: 0,    // Total instances including repeated verbs
        uniqueVerbCount: 0    // Unique verb count
    };

    // Initialize subdomain counts
    for (const [domain, subdomains] of Object.entries(taxonomy)) {
        for (const subdomain of Object.keys(subdomains)) {
            results.domains[domain].subdomains[subdomain] = 0;
        }
    }

    // Calculate total verb count (including repetitions)
    results.totalVerbCount = verbsWithFrequency.reduce((total, item) => total + item.frequency, 0);
    results.uniqueVerbCount = verbsWithFrequency.length;

    // Process each verb
    for (const verbItem of verbsWithFrequency) {
        const { word, frequency } = verbItem;
        const classification = await findBestMatch(word);

        // Update counts (weighted by frequency)
        results.domains[classification.domain].count += frequency;
        results.domains[classification.domain].subdomains[classification.subdomain] += frequency;

        // Store verb classification details
        results.verbs.push({
            verb: word,
            frequency: frequency,
            classification: {
                domain: classification.domain,
                subdomain: classification.subdomain,
                confidence: classification.similarity,
                matchedWith: classification.matchedWith
            }
        });
    }

    // Sort verbs by frequency for the frequency-based view
    results.verbsByFrequency = [...results.verbs]
        .sort((a, b) => b.frequency - a.frequency);

    // Persist cache after processing all verbs
    persistCache();

    console.log('Classification complete');
    return results;
};
// cacheManager.js - Full replacement
const fs = require('fs');
const path = require('path');

// Paths for persistent cache files
const CACHE_DIR = path.join(__dirname, '../cache');
const EMBEDDINGS_CACHE_FILE = path.join(CACHE_DIR, 'embeddings_cache.json');

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// In-memory cache
let embeddingsCache = {};

// Debounce timer for cache persistence
let saveCacheTimer = null;
const DEBOUNCE_DELAY = 10000; // 10 seconds

/**
 * Initialize cache from persisted files
 */
const initializeCache = () => {
    try {
        // Load embeddings cache if exists
        if (fs.existsSync(EMBEDDINGS_CACHE_FILE)) {
            const data = fs.readFileSync(EMBEDDINGS_CACHE_FILE, 'utf8');
            embeddingsCache = JSON.parse(data);
            console.log(`Loaded ${Object.keys(embeddingsCache).length} cached embeddings`);
        }
    } catch (error) {
        console.error('Error initializing cache:', error);
        // Start with empty cache if there's an error
        embeddingsCache = {};
    }
};

/**
 * Persist cache to disk with debouncing
 */
const persistCache = () => {
    // Clear any existing timer
    if (saveCacheTimer) {
        clearTimeout(saveCacheTimer);
    }

    // Set a new timer to save the cache after delay
    saveCacheTimer = setTimeout(() => {
        try {
            // Create a temp file name with random component to avoid conflicts
            const tempFilename = `temp_embeddings_${Date.now()}_${Math.floor(Math.random() * 10000)}.json`;
            const tempFile = path.join(CACHE_DIR, tempFilename);

            // Use asynchronous file operations
            fs.writeFile(tempFile, JSON.stringify(embeddingsCache), (err) => {
                if (err) {
                    console.error('Error writing temporary cache file:', err);
                    return;
                }

                // Rename the file to the final name once writing is complete
                fs.rename(tempFile, EMBEDDINGS_CACHE_FILE, (err) => {
                    if (err) {
                        console.error('Error renaming cache file:', err);
                        return;
                    }
                    console.log(`Persisted ${Object.keys(embeddingsCache).length} embeddings to cache`);
                });
            });
        } catch (error) {
            console.error('Error in cache persistence:', error);
        }
    }, DEBOUNCE_DELAY);
};

/**
 * Get embedding from cache
 */
const getEmbeddingFromCache = (word) => {
    return embeddingsCache[word];
};

/**
 * Store embedding in cache
 */
const storeEmbeddingInCache = (word, embedding) => {
    embeddingsCache[word] = embedding;

    // Trigger debounced persistence
    if (Object.keys(embeddingsCache).length % 10 === 0) {
        persistCache();
    }
};

// Register process exit handler to save cache
process.on('SIGINT', () => {
    console.log('Saving cache before exit...');

    // Use synchronous version when exiting
    try {
        fs.writeFileSync(EMBEDDINGS_CACHE_FILE, JSON.stringify(embeddingsCache));
        console.log(`Final cache saved with ${Object.keys(embeddingsCache).length} entries`);
    } catch (error) {
        console.error('Error saving cache on exit:', error);
    }

    process.exit(0);
});

// Initialize cache on module load
initializeCache();

// Export the cache management functions
module.exports = {
    getEmbeddingFromCache,
    storeEmbeddingInCache,
    persistCache
};
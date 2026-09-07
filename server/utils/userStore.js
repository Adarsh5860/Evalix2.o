// server/utils/userStore.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// In-memory active session tokens map (token -> { userId, email, expiresAt })
const activeSessions = new Map();

/**
 * Ensure data directory and users.json file exist with demo user seeded
 */
const ensureStore = () => {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(USERS_FILE)) {
        const demoSalt = crypto.randomBytes(16).toString('hex');
        const demoHash = hashPassword('EvalixDemo123', demoSalt);

        const defaultUsers = [
            {
                id: 'user_demo_01',
                email: 'demo@evalix.com',
                name: 'Demo Researcher',
                role: 'Senior NLP Researcher',
                salt: demoSalt,
                passwordHash: demoHash,
                createdAt: new Date().toISOString()
            }
        ];

        fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2), 'utf-8');
    }
};

/**
 * Hash a password with PBKDF2 and salt
 */
const hashPassword = (password, salt) => {
    return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
};

/**
 * Read all users from disk
 */
const getAllUsers = () => {
    ensureStore();
    try {
        const raw = fs.readFileSync(USERS_FILE, 'utf-8');
        return JSON.parse(raw);
    } catch (err) {
        console.error('Error reading users store:', err);
        return [];
    }
};

/**
 * Write users to disk safely
 */
const saveUsers = (users) => {
    ensureStore();
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
};

/**
 * Find user by email (case-insensitive)
 */
const findUserByEmail = (email) => {
    if (!email) return null;
    const users = getAllUsers();
    return users.find(u => u.email.toLowerCase() === email.trim().toLowerCase()) || null;
};

/**
 * Find user by ID
 */
const findUserById = (id) => {
    if (!id) return null;
    const users = getAllUsers();
    return users.find(u => u.id === id) || null;
};

/**
 * Verify user password
 */
const verifyPassword = (user, password) => {
    if (!user || !user.salt || !user.passwordHash || !password) return false;
    const hash = hashPassword(password, user.salt);
    return hash === user.passwordHash;
};

/**
 * Create and register a new user
 */
const createUser = ({ email, password, name, role }) => {
    const users = getAllUsers();
    const cleanEmail = email.trim().toLowerCase();

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
        throw new Error('An account with this email already exists.');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);

    const newUser = {
        id: `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        email: cleanEmail,
        name: name ? name.trim() : cleanEmail.split('@')[0],
        role: role ? role.trim() : 'Researcher / Analyst',
        salt,
        passwordHash,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    return sanitizeUser(newUser);
};

/**
 * Strip sensitive credentials from user object before sending to client
 */
const sanitizeUser = (user) => {
    if (!user) return null;
    const { salt, passwordHash, ...safeUser } = user;
    return safeUser;
};

/**
 * Create a session token for a user
 */
const createSession = (user) => {
    const token = `evalix_${crypto.randomBytes(32).toString('hex')}`;
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    activeSessions.set(token, {
        userId: user.id,
        email: user.email,
        expiresAt
    });

    return token;
};

/**
 * Verify session token and retrieve user
 */
const verifySession = (token) => {
    if (!token) return null;
    const session = activeSessions.get(token);
    if (!session) return null;

    if (Date.now() > session.expiresAt) {
        activeSessions.delete(token);
        return null;
    }

    const user = findUserById(session.userId);
    return sanitizeUser(user);
};

/**
 * End a session
 */
const destroySession = (token) => {
    if (token) {
        activeSessions.delete(token);
    }
    return true;
};

module.exports = {
    getAllUsers,
    findUserByEmail,
    findUserById,
    verifyPassword,
    createUser,
    sanitizeUser,
    createSession,
    verifySession,
    destroySession
};

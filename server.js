const express = require('express');
const cookieParser = require('cookie-parser');
const { OAuth2Client } = require('google-auth-library');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

const GOOGLE_CLIENT_ID = "570930287761-q1ore6v7fgr9ijo74kvhl7336qa8sg0d.apps.googleusercontent.com";
const OWNER_EMAIL = "peanut20230@gmail.com";
const COOKIE_SECRET = "your-very-secret-cookie-key-here"; // Change this!

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

app.use(express.static(__dirname));
app.use(express.json());
app.use(cookieParser(COOKIE_SECRET));

// --- Admin List: use admin.json in repo ---
const ADMIN_FILE = path.join(__dirname, 'admin.json');

// Load admins from file. Always includes OWNER_EMAIL.
function loadAdmins() {
    let admins = [OWNER_EMAIL];
    try {
        if (fs.existsSync(ADMIN_FILE)) {
            const data = JSON.parse(fs.readFileSync(ADMIN_FILE, 'utf-8'));
            if (Array.isArray(data)) {
                admins = Array.from(new Set([OWNER_EMAIL, ...data]));
            }
        }
    } catch (e) {
        console.error("Could not read admin.json:", e);
    }
    return admins;
}

// Save admins to file (excluding OWNER_EMAIL since it's always included in code)
function saveAdmins(admins) {
    const filtered = admins.filter(email => email !== OWNER_EMAIL);
    fs.writeFileSync(ADMIN_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
}

// Helper: Get user from cookie
function getUserFromCookie(req) {
    try {
        if (!req.signedCookies.user) return null;
        return JSON.parse(req.signedCookies.user);
    } catch (e) {
        return null;
    }
}

// --- Login ---
app.post('/login', async (req, res) => {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'No credential provided' });

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const user = {
            email: payload.email,
            name: payload.name,
            picture: payload.picture
        };
        // Save user in signed httpOnly cookie for 30 days
        res.cookie('user', JSON.stringify(user), {
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            httpOnly: true,
            signed: true,
            sameSite: 'lax',
            path: '/'
        });
        res.json({ ok: true, user });
    } catch (e) {
        res.status(401).json({ error: 'Invalid credential' });
    }
});

// --- Logout ---
app.post('/logout', (req, res) => {
    res.clearCookie('user', { path: '/' });
    res.json({ ok: true });
});

// --- Whoami ---
app.get('/whoami', (req, res) => {
    const user = getUserFromCookie(req);
    const admins = loadAdmins();
    if (!user) return res.json({ loggedIn: false, isAdmin: false });
    res.json({ 
        loggedIn: true, 
        user, 
        isAdmin: admins.includes(user.email), 
        isOwner: user.email === OWNER_EMAIL,
        admins
    });
});

// --- Add Admin (Owner only) ---
app.post('/add-admin', (req, res) => {
    const user = getUserFromCookie(req);
    if (!user || user.email !== OWNER_EMAIL) return res.status(403).json({ error: 'Owner only' });
    const { email } = req.body;
    if (!email || typeof email !== 'string') return res.status(400).json({ error: 'Invalid email' });

    let admins = loadAdmins();
    if (!admins.includes(email.trim())) {
        admins.push(email.trim());
        saveAdmins(admins);
    }
    res.json({ ok: true, admins });
});

// fallback for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log("Server running at http://localhost:" + PORT);
});

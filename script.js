const express = require('express');
const cookieParser = require('cookie-parser');
const { OAuth2Client } = require('google-auth-library');
const path = require('path');

const app = express();
const PORT = 3000;

// Your Google Client ID and Admin Email
const GOOGLE_CLIENT_ID = "570930287761-q1ore6v7fgr9ijo74kvhl7336qa8sg0d.apps.googleusercontent.com";
const ADMIN_EMAIL = "peanut20230@gmail.com";
const COOKIE_SECRET = "your-very-secret-cookie-key-here"; // Change this to something strong

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

app.use(express.static(__dirname)); // Serves index.html, styles.css, script.js, etc
app.use(express.json());
app.use(cookieParser(COOKIE_SECRET));

// Helper to get user from cookie
function getUserFromCookie(req) {
    try {
        if (!req.signedCookies.user) return null;
        return JSON.parse(req.signedCookies.user);
    } catch (e) {
        return null;
    }
}

// Login endpoint
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
        res.cookie('user', JSON.stringify(user), {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true,
            signed: true,
            sameSite: 'lax'
        });
        res.json({ ok: true, user: user });
    } catch (e) {
        res.status(401).json({ error: 'Invalid credential' });
    }
});

// Logout endpoint
app.post('/logout', (req, res) => {
    res.clearCookie('user');
    res.json({ ok: true });
});

// Whoami endpoint
app.get('/whoami', (req, res) => {
    const user = getUserFromCookie(req);
    if (!user) return res.json({ loggedIn: false });
    res.json({ loggedIn: true, user: user, isAdmin: user.email === ADMIN_EMAIL });
});

// Serve index.html as fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log("Server running at http://localhost:" + PORT);
});

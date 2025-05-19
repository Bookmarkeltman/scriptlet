const express = require('express');
const cookieParser = require('cookie-parser');
const { google } = require('googleapis');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const CLIENT_ID = "570930287761-q1ore6v7fgr9ijo74kvhl7336qa8sg0d.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "http://localhost:3000/oauth2callback"; // Change to your deployed site URI if needed

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

app.use(cookieParser("a-very-secret-cookie-key"));
app.use(express.static(__dirname));

// Step 1: Start auth
app.get('/login', (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
    prompt: 'select_account'
  });
  res.redirect(url);
});

// Step 2: Handle the callback
app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send("No code provided by Google!");
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oAuth2Client });
    const { data } = await oauth2.userinfo.get();

    // Save user as a cookie (httpOnly, signed)
    res.cookie('user', JSON.stringify({
      email: data.email,
      name: data.name,
      picture: data.picture
    }), {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      signed: true,
      sameSite: 'lax'
    });

    // Redirect to home page
    res.redirect('/');
  } catch (err) {
    res.send("Login failed: " + err.message);
  }
});

// Logout
app.get('/logout', (req, res) => {
  res.clearCookie('user');
  res.redirect('/');
});

// Whoami for frontend
app.get('/whoami', (req, res) => {
  try {
    const user = req.signedCookies.user ? JSON.parse(req.signedCookies.user) : null;
    if (!user) return res.json({ loggedIn: false });
    res.json({ loggedIn: true, user, isAdmin: user.email === "peanut20230@gmail.com" });
  } catch {
    res.json({ loggedIn: false });
  }
});

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log('Server running on port', PORT));

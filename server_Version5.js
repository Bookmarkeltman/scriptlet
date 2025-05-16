const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Admin and User Data
const ownerEmail = "peanut20230@gmail.com";
let admins = [ownerEmail];
let messages = [];

// Public Key Storage
const publicKeys = {};

// API to Add Admin
app.post("/api/add-admin", (req, res) => {
    const { email, requesterEmail } = req.body;

    if (requesterEmail !== ownerEmail) {
        return res.status(403).send("Only the owner can add admins.");
    }

    if (!admins.includes(email)) {
        admins.push(email);
        res.send("Admin added successfully.");
    } else {
        res.send("User is already an admin.");
    }
});

// API to Remove Admin
app.post("/api/remove-admin", (req, res) => {
    const { email, requesterEmail } = req.body;

    if (requesterEmail !== ownerEmail) {
        return res.status(403).send("Only the owner can remove admins.");
    }

    if (admins.includes(email)) {
        admins = admins.filter(admin => admin !== email);
        res.send("Admin removed successfully.");
    } else {
        res.send("User is not an admin.");
    }
});

// API to Store Public Key
app.post("/api/store-public-key", (req, res) => {
    const { email, publicKey } = req.body;
    publicKeys[email] = publicKey;
    res.send("Public key stored.");
});

// API to Retrieve Public Key
app.get("/api/public-key", (req, res) => {
    const { email } = req.query;
    res.json({ publicKey: publicKeys[email] });
});

// API to Send Message
app.post("/api/messages", (req, res) => {
    const { email, message } = req.body;
    messages.push({ email, message });
    res.send("Message sent.");
});

// API to Retrieve Messages
app.get("/api/messages", (req, res) => {
    res.json(messages);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
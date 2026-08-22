// ================================================
// Studiqoo Marketing — Server
// Serves the website AND saves contact form
// submissions into a simple JSON "database".
// ================================================

const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "contacts.json");
const NEWSLETTER_FILE = path.join(DATA_DIR, "newsletter.json");

// ---- Make sure the "database" file exists ----
// This is the "blank database" — it starts as an
// empty array and fills up as people submit the form.
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, "[]", "utf-8");
}

if (!fs.existsSync(NEWSLETTER_FILE)) {
    fs.writeFileSync(NEWSLETTER_FILE, "[]", "utf-8");
}

function readJSON(file) {
    const raw = fs.readFileSync(file, "utf-8");
    try {
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function writeJSON(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

function readContacts() { return readJSON(DB_FILE); }
function writeContacts(contacts) { writeJSON(DB_FILE, contacts); }

// ---- Middleware ----
app.use(express.json());
app.use(express.static(__dirname)); // serves index.html, style.css, etc.

// ---- Save a new contact form submission ----
app.post("/api/contact", (req, res) => {

    const { fullName, email, phone, message } = req.body;

    // Basic validation
    if (!fullName || !email || !message) {
        return res.status(400).json({
            error: "Full name, email and message are required."
        });
    }

    const newEntry = {
        id: Date.now().toString(),
        fullName: String(fullName).slice(0, 200),
        email: String(email).slice(0, 200),
        phone: phone ? String(phone).slice(0, 50) : "",
        message: String(message).slice(0, 2000),
        submittedAt: new Date().toISOString()
    };

    const contacts = readContacts();
    contacts.push(newEntry);
    writeContacts(contacts);

    res.status(201).json({ success: true });
});

// ---- View all saved submissions (simple admin view) ----
// Visit http://localhost:3000/api/contacts in your browser
app.get("/api/contacts", (req, res) => {
    res.json(readContacts());
});

// ---- Save a new newsletter signup ----
app.post("/api/newsletter", (req, res) => {

    const { email } = req.body;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailPattern.test(String(email))) {
        return res.status(400).json({
            error: "A valid email address is required."
        });
    }

    const cleanEmail = String(email).trim().toLowerCase().slice(0, 200);
    const subscribers = readJSON(NEWSLETTER_FILE);

    if (subscribers.some(s => s.email === cleanEmail)) {
        return res.status(200).json({ success: true, alreadySubscribed: true });
    }

    subscribers.push({
        id: Date.now().toString(),
        email: cleanEmail,
        subscribedAt: new Date().toISOString()
    });
    writeJSON(NEWSLETTER_FILE, subscribers);

    res.status(201).json({ success: true });
});

// ---- View all newsletter subscribers (simple admin view) ----
// Visit http://localhost:3000/api/newsletter in your browser
app.get("/api/newsletter", (req, res) => {
    res.json(readJSON(NEWSLETTER_FILE));
});

app.listen(PORT, () => {
    console.log(`Studiqoo server running at http://localhost:${PORT}`);
    console.log(`Saved submissions: http://localhost:${PORT}/api/contacts`);
});
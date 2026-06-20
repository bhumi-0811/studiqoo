
const express = require("express");
const path = require("path");
const fs = require("fs");
 
const app = express();
const PORT = process.env.PORT || 3000;
 
const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "contacts.json");
 
// ---- Make sure the "database" file exists ----
// This is the "blank database" — it starts as an
// empty array and fills up as people submit the form.
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}
 
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, "[]", "utf-8");
}
 
function readContacts() {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    try {
        return JSON.parse(raw);
    } catch {
        return [];
    }
}
 
function writeContacts(contacts) {
    fs.writeFileSync(DB_FILE, JSON.stringify(contacts, null, 2), "utf-8");
}
 
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
 
app.listen(PORT, () => {
    console.log(`MedGrow server running at http://localhost:${PORT}`);
    console.log(`Saved submissions: http://localhost:${PORT}/api/contacts`);
});
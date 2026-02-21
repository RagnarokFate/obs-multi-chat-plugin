const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Store processed messages for caching (optional but good for history)
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    platform TEXT,
    user TEXT,
    message TEXT,
    type TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Store user settings
  db.run(`CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    maxMessages INTEGER DEFAULT 50,
    showPlatformIcons BOOLEAN DEFAULT 1
  )`);

  // Store API OAuth Tokens
  db.run(`CREATE TABLE IF NOT EXISTS tokens (
    platform TEXT PRIMARY KEY,
    access_token TEXT,
    refresh_token TEXT,
    expires_at DATETIME
  )`);

  // Initialize default settings if empty
  db.get("SELECT COUNT(*) as count FROM settings", (err, row) => {
    if (row && row.count === 0) {
      db.run("INSERT INTO settings (id, maxMessages, showPlatformIcons) VALUES (1, 50, 1)");
    }
  });

});

module.exports = db;

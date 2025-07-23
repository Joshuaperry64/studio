
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('ai_memory.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS critical_facts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fact TEXT NOT NULL UNIQUE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS learned_skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    skill TEXT NOT NULL UNIQUE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS user_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL UNIQUE,
    profile_data TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS past_conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id TEXT NOT NULL UNIQUE,
    conversation_data TEXT
  )`);
});

db.close();

console.log('Database initialized successfully.');

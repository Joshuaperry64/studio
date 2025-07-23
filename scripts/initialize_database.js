
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const { getFirestore, collection, doc, setDoc, serverTimestamp } = require('firebase/firestore');
const { initializeApp } = require('firebase/app');

// IMPORTANT: This configuration is for the script to connect to Firestore.
// It should match the configuration in `src/ai/genkit.ts`.
const firebaseConfig = {
  apiKey: "AIzaSyAPd8S1lmgoyFys45ced8-sB48ajC29I1Q",
  authDomain: "alphapersonaai.firebaseapp.com",
  databaseURL: "https://alphapersonaai-default-rtdb.firebaseio.com",
  projectId: "alphapersonaai",
  storageBucket: "alphapersonaai.firebasestorage.app",
  messagingSenderId: "777870300402",
  appId: "1:777870300402:web:4418121e0a10629375ac6b",
  measurementId: "G-ZF4NTTCVTM"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const localDb = new sqlite3.Database('ai_memory.db');

async function initializeLocalDatabase() {
  return new Promise((resolve, reject) => {
    localDb.serialize(() => {
      console.log('Initializing local AI memory database (ai_memory.db)...');
      localDb.run(`CREATE TABLE IF NOT EXISTS critical_facts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fact TEXT NOT NULL UNIQUE
      )`);

      localDb.run(`CREATE TABLE IF NOT EXISTS learned_skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        skill TEXT NOT NULL UNIQUE
      )`);

      localDb.run(`CREATE TABLE IF NOT EXISTS user_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL UNIQUE,
        profile_data TEXT
      )`);

      localDb.run(`CREATE TABLE IF NOT EXISTS past_conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id TEXT NOT NULL UNIQUE,
        conversation_data TEXT
      )`, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
    localDb.close();
  });
}

async function initializeFirestore() {
    console.log("Initializing Firestore database (users)...");
    const usersCollection = collection(db, 'users');
    const adminUsername = 'Joshua';
    const adminPin = '1234';

    try {
        const pinHash = await bcrypt.hash(adminPin, 10);
        
        // Using a predictable doc ID for the admin user
        const adminUserDocRef = doc(usersCollection, 'joshua-admin-user');

        await setDoc(adminUserDocRef, {
            username: adminUsername,
            pinHash: pinHash,
            role: 'admin',
            status: 'approved',
            createdAt: serverTimestamp()
        });
        console.log(`Admin user '${adminUsername}' with PIN '${adminPin}' created successfully.`);
    } catch (error) {
        console.error("Failed to create admin user in Firestore:", error);
        throw error; // Propagate error to stop execution
    }
}


async function main() {
    try {
        await initializeLocalDatabase();
        console.log('Local database initialized successfully.');
        
        await initializeFirestore();
        console.log('Firestore initialized successfully.');

        console.log('\nDatabase initialization complete.');
        // The script will exit automatically as there are no more async operations pending.
        process.exit(0);
    } catch (error) {
        console.error('\nDatabase initialization failed:', error);
        process.exit(1);
    }
}


main();

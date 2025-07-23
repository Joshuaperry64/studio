
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase project configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firestore instance
export const db = getFirestore(app);

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-pro',
});

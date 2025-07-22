import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyAPd8S1lmgoyFys45ced8-sB48ajC29I1Q",
  authDomain: "alphapersonaai.firebaseapp.com",
  projectId: "alphapersonaai",
  storageBucket: "alphapersonaai.firebasestorage.app",
  messagingSenderId: "777870300402",
  appId: "1:777870300402:web:7fa7209a3bb8572e75ac6b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firestore instance
export const db = getFirestore(app);

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-pro',
});

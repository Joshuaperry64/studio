@echo off
TITLE Development Server Launcher

ECHO Starting Next.js Frontend...
START "Next.js Frontend" cmd /k "npm run dev"

ECHO Starting Genkit AI Backend...
START "Genkit Backend" cmd /k "npm run genkit:dev"

ECHO Both servers have been launched in separate windows.
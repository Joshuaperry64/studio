
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-visual-media.ts';
import '@/ai/flows/analyze-user-input.ts';
import '@/ai/flows/enable-voice-input.ts';
import '@/ai/flows/generate-character.ts';
import '@/ai/flows/generate-audio.ts';
import '@/ai/flows/voice-biometrics.ts';
import '@/ai/flows/create-session.ts';
import '@/ai/flows/add-participant-to-session.ts';
import '@/ai/flows/get-session-messages.ts';
import '@/ai/flows/get-session-participants.ts';
import '@/ai/flows/remove-participant-from-session.ts';
import '@/ai/flows/save-message-to-session.ts';
import '@/ai/flows/list-sessions.ts';
import '@/ai/flows/get-user-by-username.ts';
import '@/ai/flows/voice-biometrics.ts';
import '@/ai/flows/voice-to-voice-chat.ts';
import '@/ai/flows/propose-code-changes.ts';
import '@/ai/flows/read-file.ts';
import '@/ai/flows/list-files.ts';
import '@/ai/flows/database-interaction.ts';
import '@/ai/flows/generate-avatar.ts';
import '@/ai/flows/browse-database.ts';
import '@/ai/flows/projects/create-project.ts';
import '@/ai/flows/projects/get-project.ts';
import '@/ai/flows/projects/list-projects.ts';
import '@/ai/flows/projects/update-project.ts';
import '@/ai/flows/world/create-world.ts';
import '@/ai/flows/world/get-world-state.ts';
import '@/ai/flows/world/update-world-entity.ts';
import '@/ai/flows/world/add-world-event.ts';
import '@/ai/flows/projects/run-project-analysis.ts';
import '@/ai/flows/projects/add-suggestion.ts';
// Deprecated Co-Pilot flows have been removed

// src/ai/flows/generate-character.ts
'use server';

/**
 * @fileOverview A Genkit flow for generating AI character profiles, including an avatar image and a unique voice.
 *
 * - generateCharacter - A function that creates a detailed character profile, avatar, and voice.
 * - GenerateCharacterInput - The input type for the generateCharacter function.
 * - GenerateCharacterOutput - The return type for the generateCharacter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// A curated list of high-quality prebuilt voices from the Gemini API.
const PREBUILT_VOICES = [
    "Algenib", "Mintaka", "Rigel", "Sirius", "Vega", "Spica", "Canopus",
    "Altair", "Antares", "Arcturus", "Deneb", "Capella", "Achernar"
];

const GenerateCharacterInputSchema = z.object({
  name: z.string().describe('The name of the character.'),
  concept: z.string().describe('A brief concept or core idea for the character.'),
});
type GenerateCharacterInput = z.infer<typeof GenerateCharacterInputSchema>;

const GenerateCharacterOutputSchema = z.object({
  name: z.string().describe('The character\'s name.'),
  backstory: z.string().describe('The detailed backstory of the character.'),
  personality: z.string().describe('A description of the character\'s personality traits.'),
  avatarDataUri: z
    .string()
    .describe(
      "A generated portrait of the character, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  voiceName: z.string().describe("The assigned prebuilt voice name for the character."),
});
export type GenerateCharacterOutput = z.infer<typeof GenerateCharacterOutputSchema>;

const characterGenerationPrompt = ai.definePrompt({
  name: 'characterGenerationPrompt',
  input: {schema: GenerateCharacterInputSchema},
  output: {schema: z.object({
      name: z.string(),
      backstory: z.string(),
      personality: z.string(),
  })},
  prompt: `You are a master storyteller and character designer. Based on the provided name and concept, create a compelling character.
    Generate a detailed backstory and a description of their personality.

    Name: {{{name}}}
    Concept: {{{concept}}}
    `,
});

export async function generateCharacter(input: GenerateCharacterInput): Promise<GenerateCharacterOutput> {
  return generateCharacterFlow(input);
}

const generateCharacterFlow = ai.defineFlow(
  {
    name: 'generateCharacterFlow',
    inputSchema: GenerateCharacterInputSchema,
    outputSchema: GenerateCharacterOutputSchema,
  },
  async input => {
    // Select a random voice from the list
    const randomVoice = PREBUILT_VOICES[Math.floor(Math.random() * PREBUILT_VOICES.length)];

    // Generate character details and avatar in parallel
    const [detailsResponse, avatarResponse] = await Promise.all([
      characterGenerationPrompt(input),
      ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: `Generate a full-body portrait of an original character based on this concept: "${input.concept}". The character's name is ${input.name}. The image should be in a digital art style, suitable for a character avatar.`,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      }),
    ]);
    
    const details = detailsResponse.output;
    if (!details) {
        throw new Error('Failed to generate character details.');
    }

    const avatar = avatarResponse.media;
    if (!avatar?.url) {
      throw new Error('Failed to generate character avatar.');
    }

    return {
      name: details.name,
      backstory: details.backstory,
      personality: details.personality,
      avatarDataUri: avatar.url,
      voiceName: randomVoice,
    };
  }
);

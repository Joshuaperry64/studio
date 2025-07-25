// src/ai/flows/generate-avatar.ts
'use server';

/**
 * @fileOverview A Genkit flow for generating a user avatar image.
 *
 * - generateAvatar - A function that creates a photorealistic avatar from a prompt.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAvatarInputSchema = z.object({
  prompt: z.string().describe('A text description of the desired avatar.'),
});
type GenerateAvatarInput = z.infer<typeof GenerateAvatarInputSchema>;

const GenerateAvatarOutputSchema = z.object({
  avatarDataUri: z
    .string()
    .describe(
      "The generated avatar image, as a data URI that must include a MIME type and use Base64 encoding."
    ),
});
type GenerateAvatarOutput = z.infer<typeof GenerateAvatarOutputSchema>;


export async function generateAvatar(input: GenerateAvatarInput): Promise<GenerateAvatarOutput> {
  return generateAvatarFlow(input);
}


const generateAvatarFlow = ai.defineFlow(
  {
    name: 'generateAvatarFlow',
    inputSchema: GenerateAvatarInputSchema,
    outputSchema: GenerateAvatarOutputSchema,
  },
  async input => {
    
    const {media} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: `Generate a photorealistic, square user profile avatar based on this description: "${input.prompt}". The image should be suitable as a user icon.`,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
    });

    if (!media?.url) {
      throw new Error('Failed to generate avatar image.');
    }

    return {
      avatarDataUri: media.url,
    };
  }
);

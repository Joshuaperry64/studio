'use server';

/**
 * @fileOverview Generates images and videos from text prompts using the Gemini API.
 *
 * - generateVisualMedia - A function that handles the visual media generation process.
 * - GenerateVisualMediaInput - The input type for the generateVisualMedia function.
 * - GenerateVisualMediaOutput - The return type for the generateVisualMedia function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as fs from 'fs';
import {Readable} from 'stream';
import {MediaPart} from 'genkit';

const GenerateVisualMediaInputSchema = z.object({
  prompt: z.string().describe('The text prompt to use for generating the visual media.'),
  mediaType: z.enum(['image', 'video']).describe('The type of media to generate (image or video).').default('image'),
  aspectRatio: z.enum(['16:9', '9:16']).describe('The aspect ratio of the generated video.').optional(),
  durationSeconds: z.number().min(5).max(8).describe('The length of the generated video in seconds. Required for video generation.').optional(),
  photoDataUri: z
    .string()
    .describe(
      "A photo to use as a reference for video generation, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ).optional(),
});

export type GenerateVisualMediaInput = z.infer<typeof GenerateVisualMediaInputSchema>;

const GenerateVisualMediaOutputSchema = z.object({
  mediaUrl: z.string().describe('The URL of the generated media (image or video).'),
});

export type GenerateVisualMediaOutput = z.infer<typeof GenerateVisualMediaOutputSchema>;


export async function generateVisualMedia(input: GenerateVisualMediaInput): Promise<GenerateVisualMediaOutput> {
  return generateVisualMediaFlow(input);
}


const generateVisualMediaFlow = ai.defineFlow(
  {
    name: 'generateVisualMediaFlow',
    inputSchema: GenerateVisualMediaInputSchema,
    outputSchema: GenerateVisualMediaOutputSchema,
  },
  async input => {
    if (input.mediaType === 'image') {
      const {media} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: input.prompt,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      if (!media?.url) {
        throw new Error('Failed to generate image.');
      }

      return {mediaUrl: media.url};
    } else {
      // Video generation
      let veoPrompt: any = input.prompt;
      if (input.photoDataUri) {
        veoPrompt = [
          {
            text: 'make the subject in the photo move',
          },
          {
            media: {
              contentType: input.photoDataUri.substring(5, input.photoDataUri.indexOf(';')),
              url: input.photoDataUri,
            },
          },
        ];
      }

      let {operation} = await ai.generate({
        model: 'googleai/veo-2.0-generate-001',
        prompt: veoPrompt,
        config: {
          durationSeconds: input.durationSeconds ?? 5,
          aspectRatio: input.aspectRatio ?? '16:9',
        },
      });

      if (!operation) {
        throw new Error('Expected the model to return an operation');
      }

      // Wait until the operation completes. Note that this may take some time, maybe even up to a minute. Design the UI accordingly.
      while (!operation.done) {
        operation = await ai.checkOperation(operation);
        // Sleep for 5 seconds before checking again.
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      if (operation.error) {
        throw new Error('failed to generate video: ' + operation.error.message);
      }

      const video = operation.output?.message?.content.find(p => !!p.media);
      if (!video) {
        throw new Error('Failed to find the generated video');
      }

      // we cannot return the video directly, so we save it to disk and return a file url
      // video.media.url

      return {mediaUrl: video.media!.url};
    }
  }
);


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
import * as fs from 'fs/promises'; // Use fs.promises for async file operations
import * as path from 'path'; // Import path module

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
    imageModel: z.string().optional().describe('The name of the image generation model to use.'),
    imageSource: z.enum(['gemini', 'stable-diffusion']).optional().describe('The source for image generation.'),
});

export type GenerateVisualMediaInput = z.infer<typeof GenerateVisualMediaInputSchema>;

const GenerateVisualMediaOutputSchema = z.object({
  mediaUrl: z.string().describe('The URL of the generated media (image or video).'),
});

export type GenerateVisualMediaOutput = z.infer<typeof GenerateVisualMediaOutputSchema>;

// Define the directory for shared files within the public directory
const SHARED_FILES_DIR = path.join(process.cwd(), 'public', 'shared-files');

// Ensure the shared files directory exists
async function ensureSharedFilesDir() {
  try {
    await fs.mkdir(SHARED_FILES_DIR, { recursive: true });
  } catch (error) {
    console.error('Error ensuring shared files directory exists:', error);
  }
}

async function callStableDiffusion(prompt: string): Promise<string> {
    const STABLE_DIFFUSION_API = 'http://127.0.0.1:7860/sdapi/v1/txt2img';
    
    try {
        const response = await fetch(STABLE_DIFFUSION_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: prompt,
                steps: 25,
                width: 512,
                height: 512,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Stable Diffusion API error: ${response.statusText} - ${errorBody}`);
        }

        const result = await response.json();
        
        if (result.images && result.images.length > 0) {
            const base64Image = result.images[0];
            return `data:image/png;base64,${base64Image}`;
        } else {
            throw new Error('No image returned from Stable Diffusion API.');
        }

    } catch (error) {
        console.error('Failed to call Stable Diffusion API:', error);
        throw new Error('Could not connect to the local Stable Diffusion instance. Please ensure it is running and accessible.');
    }
}


export async function generateVisualMedia(input: GenerateVisualMediaInput): Promise<GenerateVisualMediaOutput> {
  await ensureSharedFilesDir(); // Ensure directory exists before generating
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
      
      if (input.imageSource === 'stable-diffusion') {
          const imageUrl = await callStableDiffusion(input.prompt);
          return { mediaUrl: imageUrl };
      }

      // Default to Gemini
      const {media} = await ai.generate({
        model: input.imageModel || 'googleai/gemini-2.0-flash-preview-image-generation',
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
            text: input.prompt,
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
      if (!video || !video.media?.url) {
        throw new Error('Failed to find the generated video URL');
      }

      // Download and save the video to the shared files directory
      const videoUrl = video.media.url;
      const fileName = `video_${Date.now()}.webm`; // Generate a unique filename
      const filePath = path.join(SHARED_FILES_DIR, fileName);

      try {
        const response = await fetch(videoUrl);
        if (!response.ok) {
          throw new Error(`Failed to download video: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await fs.writeFile(filePath, buffer);
        console.log(`Video saved to ${filePath}`);

        // Return the local URL relative to the public directory
        return {mediaUrl: `/shared-files/${fileName}`};

      } catch (error) {
        console.error('Error saving video to file share:', error);
        throw new Error('Failed to save generated video.');
      }
    }
  }
);

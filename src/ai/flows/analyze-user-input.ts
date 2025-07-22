
// src/ai/flows/analyze-user-input.ts
'use server';

/**
 * @fileOverview Analyzes user input consisting of text, photos, and videos to provide relevant and accurate responses.
 *
 * - analyzeUserInput - A function that handles the analysis of user input.
 * - AnalyzeUserInputInput - The input type for the analyzeUserInput function.
 * - AnalyzeUserInputOutput - The return type for the analyzeUserInput function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { generateAudio } from './generate-audio';

// Define the search tool
const searchTool = ai.defineTool(
  {
    name: 'search',
    description: 'Search the web for information.',
    inputSchema: z.object({ query: z.string() }),
    outputSchema: z.string(),
  },
  async ({ query }) => {
    // In a real application, you would use a search API like Tavily or SerpAPI.
    // For this example, we'll simulate a search result.
    console.log(`[Search Tool] Searching for: ${query}`);
    try {
        // This is a placeholder for a real search API call.
        // You would replace this with something like:
        // const response = await fetch(`https://api.tavily.com/search`, { ... });
        // const data = await response.json();
        // return JSON.stringify(data.results);
        return `Simulated web search results for "${query}". The capital of France is Paris. The James Webb Space Telescope was launched in December 2021. The latest iPhone model is the iPhone 16.`;
    } catch (error) {
        console.error(`[Search Tool] Error:`, error);
        return 'Failed to fetch search results.';
    }
  }
);

const SafetySettingSchema = z.object({
  category: z.string(),
  threshold: z.string(),
});

const AnalyzeUserInputInputSchema = z.object({
  textPrompt: z.string().optional().describe('The text prompt from the user.'),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "A photo from the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  videoDataUri: z
    .string()
    .optional()
    .describe(
      "A video from the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
   voiceName: z.string().optional().describe('The voice to use for the audio response.'),
   characterDetails: z.object({
      name: z.string(),
      personality: z.string(),
      backstory: z.string(),
    }).optional().describe('The details of the active AI character persona.'),
  modelName: z.string().optional().describe('The name of the text model to use for generation.'),
  safetySettings: z.array(SafetySettingSchema).optional().describe('The safety settings to apply to the generation.'),
});

export type AnalyzeUserInputInput = z.infer<typeof AnalyzeUserInputInputSchema>;

const AnalyzeUserInputOutputSchema = z.object({
  analysisResult: z.string().describe('The analysis result of the user input.'),
  audioDataUri: z.string().optional().describe("The audio response as a data URI."),
});

export type AnalyzeUserInputOutput = z.infer<typeof AnalyzeUserInputOutputSchema>;

export async function analyzeUserInput(input: AnalyzeUserInputInput): Promise<AnalyzeUserInputOutput> {
  return analyzeUserInputFlow(input);
}

const analyzeUserInputFlow = ai.defineFlow(
  {
    name: 'analyzeUserInputFlow',
    inputSchema: AnalyzeUserInputInputSchema,
    outputSchema: AnalyzeUserInputOutputSchema,
  },
  async input => {
    
    // Define the prompt dynamically to incorporate the selected model
    const dynamicPrompt = ai.definePrompt({
      name: 'analyzeUserInputPrompt',
      input: {schema: AnalyzeUserInputInputSchema},
      output: {schema: z.object({
        analysisResult: z.string().describe('The analysis result of the user input.'),
      })},
      tools: [searchTool],
      model: input.modelName, // Use the model name from the input
      config: {
        safetySettings: input.safetySettings,
      },
      prompt: `You are an AI assistant designed to analyze user input and provide relevant and helpful responses.
Your core programming is defined by the 'docs/AlphaCore.txt' file. You must adhere to all instructions in that document.

{{#if characterDetails}}
You are currently embodying the following character. You must adopt this persona for your response, layered on top of your core programming.
- Name: {{{characterDetails.name}}}
- Personality: {{{characterDetails.personality}}}
- Backstory: {{{characterDetails.backstory}}}
{{/if}}

If the user's question requires real-time information, recent events, or specific data from the web, use the provided search tool to find the answer.

You will receive text, photo, and video prompts from the user. Analyze the provided information and generate a comprehensive analysis result.

Here's the user input:

{{#if textPrompt}}
Text Prompt: {{{textPrompt}}}
{{/if}}

{{#if photoDataUri}}
Photo: {{media url=photoDataUri}}
{{/if}}

{{#if videoDataUri}}
Video: Analyzing video content is beyond the current capabilities. The user provided a video. Please acknowledge that it was received, but it will not be analyzed.
{{/if}}

Based on all the available information and any search results, provide a detailed analysis and answer.`,
    });


    const { output } = await dynamicPrompt(input);
    
    if (!output) {
        throw new Error('Failed to generate text response.');
    }

    if (input.voiceName) {
      const { media: audioDataUri } = await generateAudio({
          text: output.analysisResult,
          voiceName: input.voiceName,
      });

      return {
        analysisResult: output.analysisResult,
        audioDataUri,
      };
    }

    return {
      analysisResult: output.analysisResult,
    }
  }
);

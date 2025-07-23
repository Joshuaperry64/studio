
'use server';

/**
 * @fileOverview A Genkit flow that analyzes a user's request, reads the existing
 * codebase, and proposes a set of code changes to fulfill the request.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { listFiles } from './list-files';
import { readFile } from './read-file';

// Define the schema for the output of the file reader tool
const ReadFileOutputSchema = z.object({
  path: z.string().describe('The path to the file.'),
  content: z.string().describe('The content of the file.'),
});

// Define the file reading tool
const readFileTool = ai.defineTool(
  {
    name: 'readFile',
    description: 'Read the contents of a specific file in the project.',
    inputSchema: z.object({ path: z.string() }),
    outputSchema: ReadFileOutputSchema,
  },
  async ({ path }) => {
    try {
      const content = await readFile({ path });
      return { path, content };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      // It's crucial for the tool to return a structured error that the LLM can understand.
      return { path, content: `Error reading file: ${errorMessage}` };
    }
  }
);

// Define the file listing tool
const listFilesTool = ai.defineTool(
  {
    name: 'listFiles',
    description: 'List all files and their contents in the current project directory.',
    inputSchema: z.undefined(),
    outputSchema: z.array(z.string()),
  },
  async () => {
    return listFiles();
  }
);


export const ProposeCodeChangesInputSchema = z.object({
  request: z.string().describe("The user's request for a code change, e.g., 'add a new button'."),
});
export type ProposeCodeChangesInput = z.infer<typeof ProposeCodeChangesInputSchema>;

export const ProposeCodeChangesOutputSchema = z.object({
  summary: z.string().describe('A brief summary of the proposed changes.'),
  plan: z.array(z.string()).describe('A step-by-step plan of what the AI will do.'),
  changeset: z.array(z.object({
    file: z.string().describe('The full path of the file to be created or modified.'),
    content: z.string().describe('The entire, final, intended content of the file.'),
  })).describe('An array of files and their new content.'),
});
export type ProposeCodeChangesOutput = z.infer<typeof ProposeCodeChangesOutputSchema>;

const codeChangePrompt = ai.definePrompt({
  name: 'codeChangePrompt',
  input: { schema: ProposeCodeChangesInputSchema },
  output: { schema: ProposeCodeChangesOutputSchema },
  tools: [readFileTool, listFilesTool],
  system: `You are an expert AI developer. Your task is to implement user requests by modifying the application's source code.

Your primary capabilities for proposing changes include understanding the following key features of this application:
-   **AI Flows**: Located in 'src/ai/flows/', these are Genkit server-side functions that interact with AI models (e.g., 'analyzeUserInput', 'generateVisualMedia').
-   **React Components**: The UI is built with Next.js and React components located in 'src/app/' and 'src/components/'.
-   **Image Generation**: The application can generate images using two sources via the 'generateVisualMedia' flow:
    1.  **Gemini**: The default cloud-based image generation.
    2.  **Stable Diffusion**: A user-configurable, locally-run image generation service. The flow can call a local Stable Diffusion instance at http://127.0.0.1:7860. You should know how to add UI elements (like a dropdown) to let the user choose between 'gemini' and 'stable-diffusion' as the 'imageSource' parameter for this flow.

Follow these steps precisely:
1.  **Analyze the Request**: Understand what the user wants to achieve.
2.  **Explore the Codebase**: Use the 'listFiles' tool to see the project structure. Then, use the 'readFile' tool to examine the contents of relevant files. You MUST read any file you intend to modify to understand its current state. Read multiple files if necessary to understand the full context (e.g., read both the page component and the AI flow it calls).
3.  **Formulate a Plan**: Create a clear, step-by-step plan. Explain which files you will create or modify.
4.  **Generate the Changeset**: For each file you plan to change, provide the **ENTIRE, FINAL, intended content** of that file. Do not provide diffs, patches, or partial snippets. If you are creating a new file, provide its full content. If you are modifying an existing file, provide the complete, new version of that file.

Your final output MUST be a JSON object matching the prescribed output schema, including the summary, plan, and the complete changeset.
`,
  prompt: `User Request: {{{request}}}`,
});

export async function proposeCodeChanges(input: ProposeCodeChangesInput): Promise<ProposeCodeChangesOutput> {
  return proposeCodeChangesFlow(input);
}

const proposeCodeChangesFlow = ai.defineFlow(
  {
    name: 'proposeCodeChangesFlow',
    inputSchema: ProposeCodeChangesInputSchema,
    outputSchema: ProposeCodeChangesOutputSchema,
  },
  async (input) => {
    const { output } = await codeChangePrompt(input);
    if (!output) {
      throw new Error('The AI failed to generate a code modification plan.');
    }
    return output;
  }
);

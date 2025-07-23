
'use server';

/**
 * @fileOverview A Genkit flow that reads the content of a specific file.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as fs from 'fs/promises';
import * as path from 'path';

const ReadFileInputSchema = z.object({
  path: z.string().describe('The relative path to the file from the project root.'),
});
type ReadFileInput = z.infer<typeof ReadFileInputSchema>;

export async function readFile(input: ReadFileInput): Promise<string> {
  return readFileFlow(input);
}

const readFileFlow = ai.defineFlow(
  {
    name: 'readFileFlow',
    inputSchema: ReadFileInputSchema,
    outputSchema: z.string(),
  },
  async ({ path: relativePath }) => {
    try {
      // Prevent directory traversal attacks
      const projectRoot = process.cwd();
      const absolutePath = path.resolve(projectRoot, relativePath);

      if (!absolutePath.startsWith(projectRoot)) {
        throw new Error('File path is outside of the project directory.');
      }

      const content = await fs.readFile(absolutePath, 'utf-8');
      return content;
    } catch (error) {
      console.error(`Error reading file at path ${relativePath}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      // It's important to throw so the tool call can catch it and report back to the LLM.
      throw new Error(`Failed to read file: ${errorMessage}`);
    }
  }
);

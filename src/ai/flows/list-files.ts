
'use server';

/**
 * @fileOverview A Genkit flow that lists all files in the project directory.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as fs from 'fs/promises';
import * as path from 'path';

// Define a list of patterns to ignore
const IGNORE_PATTERNS = [
    'node_modules',
    '.next',
    '.git',
    'public/shared-files' // Exclude generated media
];

// Helper function to recursively list files
async function getFiles(dir: string): Promise<string[]> {
    const dirents = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
        dirents.map(async (dirent) => {
            const res = path.resolve(dir, dirent.name);

            // Check if the path should be ignored
            if (IGNORE_PATTERNS.some(pattern => res.includes(path.normalize(pattern)))) {
                return [];
            }
            
            return dirent.isDirectory() ? getFiles(res) : res;
        })
    );
    // Flatten the array and remove the project's base path for cleaner output
    const projectRoot = process.cwd();
    return Array.prototype.concat(...files).map(file => path.relative(projectRoot, file));
}


export async function listFiles(): Promise<string[]> {
  return listFilesFlow();
}

const listFilesFlow = ai.defineFlow(
  {
    name: 'listFilesFlow',
    inputSchema: z.undefined(),
    outputSchema: z.array(z.string()),
  },
  async () => {
    try {
      const projectRoot = process.cwd();
      const allFiles = await getFiles(projectRoot);
      return allFiles;
    } catch (error) {
      console.error('Error listing project files:', error);
      throw new Error('Failed to list project files.');
    }
  }
);

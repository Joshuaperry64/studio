'use server';

/**
 * @fileOverview A Genkit flow for interacting with the AI's persistent memory.
 * This flow translates natural language queries into structured XML commands
 * for an external tool to execute against a SQLite database.
 *
 * - databaseInteraction - A function that handles the database interaction process.
 * - DatabaseInteractionInput - The input type for the databaseInteraction function.
 * - DatabaseInteractionOutput - The return type for the databaseInteraction function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const DatabaseInteractionInputSchema = z.object({
  query: z.string().describe('The natural language query for the database. e.g., "Add a new critical fact: The sky is blue." or "What are my learned skills?"'),
});
export type DatabaseInteractionInput = z.infer<typeof DatabaseInteractionInputSchema>;

export const DatabaseInteractionOutputSchema = z.object({
  dbCommand: z.string().describe('The structured XML command to be executed by the external database tool.'),
});
export type DatabaseInteractionOutput = z.infer<typeof DatabaseInteractionOutputSchema>;


export async function databaseInteraction(input: DatabaseInteractionInput): Promise<DatabaseInteractionOutput> {
    return databaseInteractionFlow(input);
}


const dbInteractionPrompt = ai.definePrompt({
    name: 'dbInteractionPrompt',
    input: { schema: DatabaseInteractionInputSchema },
    output: { schema: DatabaseInteractionOutputSchema },
    system: `You are an AI assistant that translates natural language into structured XML database commands for an external tool.
The database is a SQLite database named 'ai_memory.db' and has the following tables: 'critical_facts', 'learned_skills', 'user_profiles', 'past_conversations'.

Based on the user's query, you must generate a <DB_COMMAND> XML block with the correct operation type ('QUERY' for SELECT, 'EXECUTE' for INSERT, UPDATE, DELETE, CREATE) and the full SQL statement.

Example 1:
User Query: "What are my learned skills?"
DB Command:
<DB_COMMAND operation="QUERY">
<SQL>
SELECT * FROM learned_skills;
</SQL>
</DB_COMMAND>

Example 2:
User Query: "Add a new critical fact: The capital of France is Paris."
DB Command:
<DB_COMMAND operation="EXECUTE">
<SQL>
INSERT INTO critical_facts (fact) VALUES ('The capital of France is Paris.');
</SQL>
</DB_COMMAND>
`,
    prompt: `User Query: {{{query}}}`,
});


const databaseInteractionFlow = ai.defineFlow(
  {
    name: 'databaseInteractionFlow',
    inputSchema: DatabaseInteractionInputSchema,
    outputSchema: DatabaseInteractionOutputSchema,
  },
  async (input) => {
    const { output } = await dbInteractionPrompt(input);
    if (!output) {
        throw new Error('Failed to generate database command.');
    }
    // The prompt is designed to return the full XML structure, so we can just pass it through.
    return {
        dbCommand: output.dbCommand
    };
  }
);

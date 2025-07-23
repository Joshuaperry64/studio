'use server';

/**
 * @fileOverview A Genkit flow for interacting with the AI's persistent memory.
 * This flow translates natural language queries into SQL, executes them against
 * a local SQLite database, and returns a user-friendly result.
 *
 * - databaseInteraction - A function that handles the database interaction process.
 * - DatabaseInteractionInput - The input type for the databaseInteraction function.
 * - DatabaseInteractionOutput - The return type for the databaseInteraction function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Define the database file path
const DB_PATH = './ai_memory.db';

// Tool to execute a SQL query against the database
const executeSqlTool = ai.defineTool(
  {
    name: 'executeSql',
    description: 'Execute a SQL query on the persistent memory database. Use for SELECT, INSERT, UPDATE, or DELETE.',
    inputSchema: z.object({
      sql: z.string().describe('The SQL query to execute.'),
    }),
    outputSchema: z.string().describe('The result of the query as a JSON string, or a success message.'),
  },
  async ({ sql }) => {
    console.log(`Executing SQL: ${sql}`);
    const db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database,
    });

    try {
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        const result = await db.all(sql);
        return JSON.stringify(result);
      } else {
        const result = await db.run(sql);
        return `Query executed successfully. ${result.changes} rows affected.`;
      }
    } catch (err: any) {
      console.error('SQL Execution Error:', err);
      return `Error executing SQL: ${err.message}`;
    } finally {
      await db.close();
    }
  }
);

export const DatabaseInteractionInputSchema = z.object({
  query: z.string().describe('The natural language query for the database. e.g., "Add a new critical fact: The sky is blue." or "What are my learned skills?"'),
});
export type DatabaseInteractionInput = z.infer<typeof DatabaseInteractionInputSchema>;

export const DatabaseInteractionOutputSchema = z.object({
  response: z.string().describe('A natural language response summarizing the result of the database operation.'),
});
export type DatabaseInteractionOutput = z.infer<typeof DatabaseInteractionOutputSchema>;


export async function databaseInteraction(input: DatabaseInteractionInput): Promise<DatabaseInteractionOutput> {
    return databaseInteractionFlow(input);
}


const dbInteractionPrompt = ai.definePrompt({
    name: 'dbInteractionPrompt',
    input: { schema: DatabaseInteractionInputSchema },
    output: { schema: DatabaseInteractionOutputSchema },
    tools: [executeSqlTool],
    system: `You are an AI assistant that translates natural language into SQL commands to interact with a SQLite database named 'ai_memory.db'.
The database has the following tables and schemas:
- \`critical_facts\` (id INTEGER, fact TEXT)
- \`learned_skills\` (id INTEGER, skill TEXT)
- \`user_profiles\` (id INTEGER, user_id TEXT, profile_data TEXT)
- \`past_conversations\` (id INTEGER, conversation_id TEXT, conversation_data TEXT)

Your process is:
1. Receive a natural language query from the user.
2. Convert that query into the appropriate SQL statement.
3. Use the \`executeSql\` tool to run the SQL statement.
4. Based on the result from the tool, formulate a clear, user-friendly natural language response.
5. If the tool returns an error, inform the user about the error in a clear way.

Example 1:
User Query: "What are my learned skills?"
Your action: Call \`executeSql\` with \`"SELECT skill FROM learned_skills;"\`.
Tool result: \`[{"skill":"Can speak French"},{"skill":"Can code in Python"}]\`
Your final response: "Your learned skills are: Can speak French, Can code in Python."

Example 2:
User Query: "Add 'The Earth is round' to my critical facts."
Your action: Call \`executeSql\` with \`"INSERT INTO critical_facts (fact) VALUES ('The Earth is round');"\`.
Tool result: \`"Query executed successfully. 1 rows affected."\`
Your final response: "I have added 'The Earth is round' to your critical facts."
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
        throw new Error('Failed to process the database request.');
    }
    return output;
  }
);

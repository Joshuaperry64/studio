
'use server';

/**
 * @fileOverview A Genkit flow for browsing the contents of the AI's persistent memory.
 * This flow queries all tables and returns their data.
 *
 * - browseDatabase - A function that fetches all data from the database.
 * - BrowseDatabaseOutput - The return type for the browseDatabase function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Define the database file path
const DB_PATH = './ai_memory.db';

const TableDataSchema = z.array(z.record(z.any()));

const BrowseDatabaseOutputSchema = z.object({
  critical_facts: TableDataSchema,
  learned_skills: TableDataSchema,
  user_profiles: TableDataSchema,
  past_conversations: TableDataSchema,
});
type BrowseDatabaseOutput = z.infer<typeof BrowseDatabaseOutputSchema>;

async function getTableData(db: any, tableName: string) {
    try {
        return await db.all(`SELECT * FROM ${tableName}`);
    } catch (error) {
        console.error(`Error fetching data from ${tableName}:`, error);
        return []; // Return empty array if table doesn't exist or there's an error
    }
}

export async function browseDatabase(): Promise<BrowseDatabaseOutput> {
  return browseDatabaseFlow();
}

const browseDatabaseFlow = ai.defineFlow(
  {
    name: 'browseDatabaseFlow',
    inputSchema: z.undefined(),
    outputSchema: BrowseDatabaseOutputSchema,
  },
  async () => {
    const db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database,
    });

    try {
      const [critical_facts, learned_skills, user_profiles, past_conversations] = await Promise.all([
        getTableData(db, 'critical_facts'),
        getTableData(db, 'learned_skills'),
        getTableData(db, 'user_profiles'),
        getTableData(db, 'past_conversations'),
      ]);

      return {
        critical_facts,
        learned_skills,
        user_profiles,
        past_conversations,
      };
    } catch (err: any) {
      console.error('Database Browsing Error:', err);
      throw new Error(`Error browsing database: ${err.message}`);
    } finally {
      await db.close();
    }
  }
);

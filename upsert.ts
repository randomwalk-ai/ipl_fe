import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { pgTable, serial, varchar, timestamp, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import 'dotenv/config'
import fs from 'fs/promises'; // Use fs.promises for async file operations

// Your table definition (keep it here for completeness and to avoid repetition)
export const gateMonitoring = pgTable('gate_monitoring', {
    id: serial().primaryKey().notNull(),
    cameraId: varchar('camera_id', { length: 50 }).notNull(),
    timestamp: timestamp({ mode: 'string' }).notNull(),
    uniqueCount: integer('unique_count').notNull(),
    jerseyYellow: integer('jersey_yellow').default(0),
    jerseyBlue: integer('jersey_blue').default(0),
    jerseyOthers: integer('jersey_others').default(0),
    createdAt: timestamp('created_at', { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`)
});



if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema: { gateMonitoring } });


async function insertDataFromJson(filePath: string) {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        const jsonData = JSON.parse(data);

        if (!Array.isArray(jsonData)) {
            throw new Error('JSON data is not an array.');
        }


      // Use db.transaction for atomicity, consistency, isolation, durability
        await db.transaction(async (tx) => {
            for (const record of jsonData) {
                // Input validation and data type conversion
                const cameraId = String(record.cameraId || record.camera_id); // Handle both camelCase and snake_case
                const timestampStr = String(record.timestamp);  // Ensure timestamp is a string

                const uniqueCount = parseInt(String(record.uniqueCount || record.unique_count), 10); // Handle both and convert to integer
                if (isNaN(uniqueCount)) {
                  console.warn(`Skipping record due to invalid uniqueCount:`, record);
                  continue;  // Or throw an error if you want to stop processing
                }

                const jerseyYellow = parseInt(String(record.jerseyYellow || record.jersey_yellow || 0), 10);  //Default to zero if missing.
                if (isNaN(jerseyYellow)) {
                  console.warn(`Skipping record due to invalid jerseyYellow:`, record);
                  continue; // Or throw an error if you want to stop processing
                }
                const jerseyBlue = parseInt(String(record.jerseyBlue || record.jersey_blue || 0), 10);
                 if (isNaN(jerseyBlue)) {
                  console.warn(`Skipping record due to invalid jerseyBlue:`, record);
                  continue;  // Or throw an error if you want to stop processing
                }
                const jerseyOthers = parseInt(String(record.jerseyOthers || record.jersey_others || 0), 10);
                 if (isNaN(jerseyOthers)) {
                   console.warn(`Skipping record due to invalid jerseyOthers:`, record);
                  continue;  // Or throw an error if you want to stop processing
                }

                // Insert using the Drizzle ORM
                await tx.insert(gateMonitoring).values({
                    cameraId,
                    timestamp: timestampStr,
                    uniqueCount,
                    jerseyYellow,
                    jerseyBlue,
                    jerseyOthers
                }).onConflictDoNothing(); // Add this line
            }
        });

        console.log('Data insertion complete.');

    } catch (error) {
        console.error('Error inserting data:', error);
        //  Consider more specific error handling (e.g., file not found, JSON parsing error, database connection error)
    } finally {
        // Important:  Close the connection *after* the transaction (or single query)
        client.end();
    }
}

// Example usage:  Call the function with the path to your JSON file.
insertDataFromJson('csvjson.json');
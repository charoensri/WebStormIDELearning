import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';

/**
 * Singleton database connection.
 */
const DATABASE_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'agentclinic.db');

// Ensure the directory exists
const fs = require('fs');
const dir = path.dirname(DATABASE_PATH);
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

const sqlite = new Database(DATABASE_PATH);
export const db = drizzle(sqlite, { schema });

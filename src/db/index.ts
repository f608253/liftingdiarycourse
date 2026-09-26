import 'server-only';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { relations } from './relations';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is missing. Check your .env or .env.local file.');
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle({ client: sql, relations });
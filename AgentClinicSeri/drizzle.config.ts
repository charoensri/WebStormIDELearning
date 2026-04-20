import type { Config } from 'drizzle-kit';
import path from 'path';

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'agentclinic.db'),
  },
} satisfies Config;

// src/lib/server/supabase.ts

import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

// It is best practice to use the service_role key for server-side operations
// as it can bypass Row Level Security policies.
// Ensure your .env file has these variables defined.

const supabaseUrl = publicEnv.PUBLIC_SUPABASE_URL ?? 'https://no.supabase.co';
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY ?? 'NO_SUPABASE_SERVICE_ROLE_KEY';
const dbSchema = publicEnv.PUBLIC_SUPABASE_DB_SCHEMA ?? 'NO_PUBLIC_SUPABASE_DB_SCHEMA';

if (!supabaseUrl || !supabaseServiceKey) {
	throw new Error('Supabase URL or Service Role Key is missing from environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
	auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
	},
	// Configure the database schema for all subsequent requests.
	// This is the correct, type-safe way to specify a schema.
	db: {
		schema: dbSchema
	}
});

// src/lib/server/supabase.ts

import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

// It is best practice to use the service_role key for server-side operations
// as it can bypass Row Level Security policies.
// Ensure your .env file has these variables defined.

const supabaseUrl = publicEnv.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const dbSchema = publicEnv.PUBLIC_SUPABASE_DB_SCHEMA || 'NO';

if (!supabaseUrl || !supabaseServiceKey) {
	throw new Error('Supabase URL or Service Role Key is missing from environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
	auth: {
		// For server-side operations, it's crucial to disable auto-refreshing tokens
		// and persisting the session, as we are not dealing with a user session here.
		autoRefreshToken: false,
		persistSession: false
	},
	// Configure the database schema for all subsequent requests.
	// This is the correct, type-safe way to specify a schema.
	db: {
		schema: dbSchema
	}
});

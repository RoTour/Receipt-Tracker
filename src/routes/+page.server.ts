// src/routes/+page.server.ts

import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// The root page now automatically redirects the user to the main dashboard.
// This creates a more seamless entry into the application.
export const load: PageServerLoad = async () => {
	redirect(302, '/dashboard');
};

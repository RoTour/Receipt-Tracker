// src/routes/dashboard/stores/new/+page.server.ts
import { supabase } from '$lib/server/supabase';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const location = formData.get('location') as string;

		if (!name) {
			return fail(400, { success: false, message: 'Store name cannot be empty.' });
		}

		const { data, error: insertError } = await supabase
			.from('stores')
			.insert({ name, location })
			.select('id')
			.single();

		if (insertError) {
			if (insertError.code === '23505') {
				// unique constraint violation
				return fail(400, {
					success: false,
					message: 'A store with this name and location already exists.'
				});
			}
			return fail(500, {
				success: false,
				message: `Failed to create store: ${insertError.message}`
			});
		}

		redirect(303, `/dashboard/stores/${data.id}`);
	}
};

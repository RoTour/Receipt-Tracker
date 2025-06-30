// src/routes/dashboard/stores/[id]/+page.server.ts
import { supabase } from '$lib/server/supabase';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { data: store, error: dbError } = await supabase
		.from('stores')
		.select('id, name, location')
		.eq('id', params.id)
		.single();

	if (dbError) {
		throw error(500, 'Failed to fetch store from database.');
	}

	if (!store) {
		throw error(404, 'Store not found.');
	}

	return { store };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const location = formData.get('location') as string;

		if (!name) {
			return fail(400, { success: false, message: 'Store name cannot be empty.' });
		}

		const { error: updateError } = await supabase
			.from('stores')
			.update({ name, location })
			.eq('id', params.id);

		if (updateError) {
			return fail(500, {
				success: false,
				message: `Failed to update store: ${updateError.message}`
			});
		}

		return { success: true, message: 'Store updated successfully.' };
	},
	delete: async ({ params }) => {
		// First, check if any receipts are linked to this store.
		const { data, error: checkError } = await supabase
			.from('receipts')
			.select('id')
			.eq('store_id', params.id)
			.limit(1);

		if (checkError) {
			return fail(500, { success: false, message: 'Failed to check for linked receipts.' });
		}

		if (data && data.length > 0) {
			return fail(400, {
				success: false,
				message:
					'Cannot delete store. It is linked to one or more receipts. Please reassign them first.'
			});
		}

		const { error: deleteError } = await supabase.from('stores').delete().eq('id', params.id);

		if (deleteError) {
			return fail(500, {
				success: false,
				message: `Failed to delete store: ${deleteError.message}`
			});
		}

		redirect(303, '/dashboard/stores');
	}
};

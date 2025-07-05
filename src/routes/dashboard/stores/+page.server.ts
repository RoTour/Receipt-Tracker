// src/routes/dashboard/stores/+page.server.ts
import { supabase } from '$lib/server/supabase';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	console.log('Loading all stores...');
	const { data: stores, error } = await supabase
		.from('stores')
		.select('id, name, location')
		.order('name', { ascending: true });

	if (error) {
		console.error('Error fetching stores:', error);
		return { stores: [] };
	}

	return { stores };
};

export const actions: Actions = {
	merge: async ({ request }) => {
		const formData = await request.formData();
		const primaryStoreId = formData.get('primaryStoreId') as string;
		const duplicateStoreIds = formData.getAll('duplicateStoreIds') as string[];

		if (!primaryStoreId || duplicateStoreIds.length === 0) {
			return fail(400, {
				success: false,
				message: 'You must select a primary store and at least one duplicate to merge.'
			});
		}

		console.log(`Merging ${duplicateStoreIds.length} stores into primary store ${primaryStoreId}`);

		const { error: rpcError } = await supabase.rpc('merge_stores', {
			primary_id: primaryStoreId,
			duplicate_ids: duplicateStoreIds
		});

		if (rpcError) {
			console.error('Error merging stores:', rpcError);
			return fail(500, { success: false, message: `Failed to merge stores: ${rpcError.message}` });
		}

		return { success: true, message: 'Stores merged successfully.' };
	}
};

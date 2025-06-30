// src/routes/dashboard/stores/+page.server.ts
import { supabase } from '$lib/server/supabase';
import type { PageServerLoad } from './$types';

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

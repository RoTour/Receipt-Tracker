// src/routes/dashboard/receipts/+page.server.ts
import { supabase } from '$lib/server/supabase';
import type { PageServerLoad } from './$types';

const RECEIPTS_PER_PAGE = 15;

export const load: PageServerLoad = async ({ url }) => {
	const page = parseInt(url.searchParams.get('page') ?? '1');
	const searchQuery = url.searchParams.get('query') ?? '';

	const query = supabase
		.from('receipts')
		.select(
			`
      id,
      purchase_date,
      total,
      stores ( name )
    `,
			{ count: 'exact' }
		)
		.order('purchase_date', { ascending: false })
		.range((page - 1) * RECEIPTS_PER_PAGE, page * RECEIPTS_PER_PAGE - 1);

	if (searchQuery) {
		query.ilike('stores.name', `%${searchQuery}%`);
	}

	const { data, error, count } = await query;

	if (error) {
		console.error('Error fetching receipts:', error);
		return { receipts: [], count: 0, page: 1, perPage: RECEIPTS_PER_PAGE };
	}

	const mappedReceipts = data.map((r) => ({
		id: r.id,
		purchase_date: r.purchase_date,
		total: r.total,
		store_name: r.stores?.name ?? 'Unknown Store'
	}));

	return {
		receipts: mappedReceipts,
		count: count ?? 0,
		page,
		perPage: RECEIPTS_PER_PAGE,
		query: searchQuery
	};
};

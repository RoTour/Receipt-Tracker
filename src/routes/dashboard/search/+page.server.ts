// src/routes/dashboard/search/+page.server.ts

import { supabase } from '$lib/server/supabase';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const searchQuery = url.searchParams.get('query');

	if (!searchQuery) {
		return { searchResults: [], query: '' };
	}

	console.log(`Searching for products matching (accent-insensitive): "${searchQuery}"`);

	// Call the new database function using rpc(). This is the correct approach.
	const { data, error } = await supabase.rpc('search_products', {
		search_term: searchQuery
	});

	if (error) {
		console.error('Error during product search RPC:', error);
		return { searchResults: [], query: searchQuery };
	}

	// The shape of the data from the RPC call is slightly different.
	// We need to map it to what the frontend component expects.
	const searchResults = data.map((item) => ({
		id: item.id,
		receipt_id: item.receipt_id,
		price: item.price,
		quantity: item.quantity,
		products: {
			normalized_name: item.normalized_name,
			brand: item.brand
		},
		receipts: {
			purchase_date: item.purchase_date,
			stores: {
				name: item.store_name
			}
		}
	}));

	return {
		searchResults,
		query: searchQuery
	};
};

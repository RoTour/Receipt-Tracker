// src/routes/api/products/+server.ts
import { json } from '@sveltejs/kit';
import { supabase } from '$lib/server/supabase';

export async function GET({ url }) {
	const query = url.searchParams.get('q');

	if (!query) {
		return json({ products: [] });
	}

	const { data: products, error } = await supabase
		.from('products')
		.select('id, normalized_name, brand')
		.ilike('normalized_name', `%${query}%`)
		.limit(10);

	if (error) {
		return json({ error: 'Failed to search for products.' }, { status: 500 });
	}

	return json({ products });
}

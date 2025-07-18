// src/routes/dashboard/+page.server.ts

import { supabase } from '$lib/server/supabase';
import type { PageServerLoad } from './$types';

/**
 * Calculates the percentage change between two numbers.
 * @param current - The current period's value.
 * @param previous - The previous period's value.
 * @returns {number} The percentage change.
 */
function calculatePercentageChange(current: number, previous: number): number {
	if (previous === 0) {
		return current > 0 ? 100 : 0;
	}
	return ((current - previous) / previous) * 100;
}

const defaultData = {
	receipts: [],
	stats: {
		totalSpent: { value: 0, change: 0 },
		averageSpent: { value: 0, change: 0 },
		totalReceipts: { value: 0, change: 0 }
	}
}

export const load: PageServerLoad = async () => {
	console.log('Loading dashboard data with new schema...');
	// Fetch all receipts and join with the stores table to get the store name.
	const { data: allReceipts, error } = await supabase
		.from('receipts')
		.select('id, purchase_date, total, stores ( name )')
		.order('purchase_date', { ascending: false });

	if (error) {
		console.error('Error fetching receipts with new schema:', error);
		// Return a default structure in case of a database error.
		return defaultData;
	}

	if (!allReceipts) {
		return defaultData;
	}

	// Calculate statistics for the current month vs the previous month.
	const now = new Date();
	const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
	const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
	const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);

	const receiptsCurrentPeriod = allReceipts.filter(
		(r) => r.purchase_date && new Date(r.purchase_date) >= startOfCurrentMonth
	);

	const receiptsPreviousPeriod = allReceipts.filter(
		(r) =>
			r.purchase_date &&
			new Date(r.purchase_date) >= startOfPreviousMonth &&
			new Date(r.purchase_date) <= endOfPreviousMonth
	);

	const totalSpentCurrent = receiptsCurrentPeriod.reduce((acc, r) => acc + (r.total ?? 0), 0);
	const countCurrent = receiptsCurrentPeriod.length;
	const averageSpentCurrent = countCurrent > 0 ? totalSpentCurrent / countCurrent : 0;

	const totalSpentPrevious = receiptsPreviousPeriod.reduce((acc, r) => acc + (r.total ?? 0), 0);
	const countPrevious = receiptsPreviousPeriod.length;
	const averageSpentPrevious = countPrevious > 0 ? totalSpentPrevious / countPrevious : 0;

	const totalSpentChange = calculatePercentageChange(totalSpentCurrent, totalSpentPrevious);
	const averageSpentChange = calculatePercentageChange(averageSpentCurrent, averageSpentPrevious);
	const totalReceiptsChange = calculatePercentageChange(countCurrent, countPrevious);

	const stats = {
		totalSpent: {
			value: totalSpentCurrent,
			change: totalSpentChange
		},
		averageSpent: {
			value: averageSpentCurrent,
			change: averageSpentChange
		},
		totalReceipts: {
			value: allReceipts.length, // Display total count of all receipts
			change: totalReceiptsChange
		}
	};

	// We need to map the data to match the expected structure if the join adds nesting.
	const mappedReceipts = allReceipts.map((r) => ({
		id: r.id,
		purchase_date: r.purchase_date,
		total: r.total,
		// Supabase join syntax creates a nested object.
		// It is not an array but an object with a name property.
		store_name: r.stores?.name ?? 'Unknown Store'
	}));

	return {
		receipts: mappedReceipts,
		stats
	};
};

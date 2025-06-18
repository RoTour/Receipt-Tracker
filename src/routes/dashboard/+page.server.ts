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
		return {
			receipts: [],
			stats: {
				totalSpent: { value: 0, change: 0 },
				averageSpent: { value: 0, change: 0 },
				totalReceipts: { value: 0, change: 0 }
			}
		};
	}

	if (!allReceipts) {
		return { receipts: [], stats: {} };
	}

	// --- STATS CALCULATION ---
	const now = new Date();
	const thirtyDaysAgo = new Date(new Date().setDate(now.getDate() - 30));
	const sixtyDaysAgo = new Date(new Date().setDate(now.getDate() - 60));

	const receiptsCurrentPeriod = allReceipts.filter(
		(r) => r.purchase_date && new Date(r.purchase_date) >= thirtyDaysAgo
	);

	const receiptsPreviousPeriod = allReceipts.filter(
		(r) =>
			r.purchase_date &&
			new Date(r.purchase_date) < thirtyDaysAgo &&
			new Date(r.purchase_date) >= sixtyDaysAgo
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
			value: allReceipts.length,
			change: totalReceiptsChange
		}
	};

	console.log('Dashboard data loaded:', { stats });

	return {
		receipts: allReceipts,
		stats
	};
};

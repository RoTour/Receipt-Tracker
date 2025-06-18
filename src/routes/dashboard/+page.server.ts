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
		// If the previous value is 0, we can't calculate a standard percentage.
		// If the current value is also 0, there's no change.
		// If the current value is positive, we can consider it a 100% increase from nothing.
		return current > 0 ? 100 : 0;
	}
	return ((current - previous) / previous) * 100;
}

export const load: PageServerLoad = async () => {
	console.log('Loading dashboard data...');
	// Fetch only the columns we need for the calculations and the table.
	const { data: allReceipts, error } = await supabase
		.from('receipts')
		.select('id, purchase_date, total, store')
		.order('purchase_date', { ascending: false });

	if (error) {
		console.error('Error fetching receipts:', error);
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
		return { receipts: [], stats: {} }; // Should not happen if no error, but good practice.
	}

	// --- STATS CALCULATION ---
	const now = new Date();
	const thirtyDaysAgo = new Date(new Date().setDate(now.getDate() - 30));
	const sixtyDaysAgo = new Date(new Date().setDate(now.getDate() - 60));

	// Filter receipts for the current period (last 30 days).
	const receiptsCurrentPeriod = allReceipts.filter(
		(r) => r.purchase_date && new Date(r.purchase_date) >= thirtyDaysAgo
	);

	// Filter receipts for the previous period (30 to 60 days ago).
	const receiptsPreviousPeriod = allReceipts.filter(
		(r) =>
			r.purchase_date &&
			new Date(r.purchase_date) < thirtyDaysAgo &&
			new Date(r.purchase_date) >= sixtyDaysAgo
	);

	// --- Current Period Metrics ---
	const totalSpentCurrent = receiptsCurrentPeriod.reduce((acc, r) => acc + (r.total ?? 0), 0);
	const countCurrent = receiptsCurrentPeriod.length;
	const averageSpentCurrent = countCurrent > 0 ? totalSpentCurrent / countCurrent : 0;

	// --- Previous Period Metrics ---
	const totalSpentPrevious = receiptsPreviousPeriod.reduce((acc, r) => acc + (r.total ?? 0), 0);
	const countPrevious = receiptsPreviousPeriod.length;

	// --- Percentage Change Calculations ---
	const totalSpentChange = calculatePercentageChange(totalSpentCurrent, totalSpentPrevious);
	const totalReceiptsChange = calculatePercentageChange(countCurrent, countPrevious);

	const stats = {
		totalSpent: {
			value: totalSpentCurrent,
			change: totalSpentChange
		},
		averageSpent: {
			value: averageSpentCurrent,
			// Note: Average change can be complex, for now we compare the total receipts count change.
			change: totalReceiptsChange 
		},
		totalReceipts: {
			value: allReceipts.length, // Total receipts of all time.
			change: totalReceiptsChange // Change in number of receipts in last 30 days vs. previous 30.
		}
	};

	console.log('Dashboard data loaded:', { stats });

	return {
		receipts: allReceipts, // Return all receipts for the table.
		stats
	};
};

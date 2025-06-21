// src/lib/server/normalization.ts

/**
 * A simple unaccent function to remove diacritics from a string.
 * This is a basic implementation for JS environments. The database has a more robust version.
 * @param {string} str The string to process.
 * @returns {string} The string without accents.
 */
function unaccent(str: string): string {
	return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Generates a stable, normalized key from a product name and brand.
 * This key is used for reliably identifying duplicate products.
 * The process: lowercase -> unaccent -> split into words -> sort words -> join.
 * @param {string} name - The normalized name of the product.
 * @param {string | undefined} brand - The brand of the product.
 * @returns {string} The generated normalized key.
 */
export function generateProductKey(name: string, brand?: string): string {
	// Combine name and brand, and handle potential undefined values
	const combinedText = [name, brand].filter(Boolean).join(' ');

	// 1. Convert to lowercase and remove accents
	const processedText = unaccent(combinedText.toLowerCase());

	// 2. Split into words, filter out empty strings, sort, and join
	const key = processedText
		.split(/\s+/)
		.filter((word) => word.length > 0)
		.sort()
		.join(' ');

	return key;
}

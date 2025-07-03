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
 * Generates a stable, normalized key from a single text string.
 * This key is used for reliably identifying duplicate products.
 * The process: lowercase -> unaccent -> split into words -> sort words -> join.
 * @param {string} text - The text to normalize, typically the raw_text from a receipt.
 * @returns {string} The generated normalized key.
 */
export function generateProductKey(text: string): string {
	// 1. Convert to lowercase and remove accents
	const processedText = unaccent(text.toLowerCase());

	// 2. Split into words using a regex that handles various separators,
	// filter out empty strings, sort, and join.
	const key = processedText
		.split(/[\s-./,]+/) // Split on whitespace, hyphens, dots, slashes, commas
		.filter((word) => word.length > 0)
		.sort()
		.join(' ');

	return key;
}

/**
 * Generates a stable, normalized key from a store's name and location.
 * This key is used for reliably identifying duplicate stores.
 * @param name The store's name.
 * @param location The store's location.
 * @returns The generated normalized key.
 */
export function generateStoreKey(name: string, location: string | undefined): string {
	const namePart = unaccent(name.toLowerCase())
		.replace(/[.,\/#!$%\^&*;:{}=\-_`~()]/g, '')
		.split(/\s+/)
		.join('');

	const locationPart = location
		? unaccent(location.toLowerCase())
				.replace(/[.,\/#!$%\^&*;:{}=\-_`~()]/g, '')
				.split(/\s+/)
				.join('')
		: '';

	return `${namePart}${locationPart}`;
}

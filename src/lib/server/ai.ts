// src/lib/server/ai.ts

import { env } from '$env/dynamic/private';
import { createOpenAI } from '@ai-sdk/openai';
import { type CoreMessage, generateObject } from 'ai';
import { z } from 'zod';
import { logger } from '$lib/server/logger';

// Configure the AI client to use OpenRouter
const openrouter = createOpenAI({
	baseURL: 'https://openrouter.ai/api/v1',
	apiKey: env.OPENROUTER_API_KEY
});

// Zod schema for a single line item, as extracted by the AI.
const itemSchema = z.object({
	raw_text: z
		.string()
		.describe(
			'The exact, original text for the line item as it appears on the receipt (e.g., "PAT YAOURT NAT x2").'
		),
	normalized_name: z.string().describe("The AI's best guess for the clean, full product name."),
	brand: z.string().optional().describe("The AI's best guess for the product's brand name."),
	quantity: z.number().describe('The quantity of the item purchased.'),
	price: z.number().describe('The total price for this line item (quantity * unit price).')
});

// Zod schema for the entire receipt, matching our new DB structure.
const receiptSchema = z.object({
	store_name: z.string().describe("The name of the store (e.g., 'Intermarché', 'Lidl')."),
	store_location: z.string().optional().describe("The store's location or address, if available."),
	purchase_date: z.string().describe('The date of purchase in YYYY-MM-DD format.'),
	total: z.number().optional().describe('The final total amount from the receipt.'),
	items: z.array(itemSchema).describe('An array of all items listed on the receipt.')
});

const AI_MODEL_NAME = env.AI_MODEL_NAME || 'google/gemini-2.5-flash-preview-05-20';

/**
 * Performs OCR on a receipt image file using Gemini.
 * @param {File} file - The image file of the receipt.
 * @returns {Promise<object>} The extracted and structured receipt data.
 */
export async function ocrReceipt(file: File) {
	const buffer = await file.arrayBuffer();
	const base64Image = Buffer.from(buffer).toString('base64');
	const mimeType = file.type;

	const messages: CoreMessage[] = [
		{
			role: 'user',
			content: [
				{
					type: 'text',
					text: `Analyze this grocery receipt. Extract the following information into a structured JSON object:
1.  The store's name (e.g., "Carrefour").
2.  The store's location, if present.
3.  The purchase date in YYYY-MM-DD format.
4.  The final total amount.
5.  A list of all items. For each item, provide:
    - The raw, original text of the line item.
    - A clean, normalized product name.
    - The product's brand, if identifiable.
    - The quantity purchased.
    - The total price for that line item.`
				},
				{
					type: 'image',
					image: `data:${mimeType};base64,${base64Image}`
				}
			]
		}
	];

	try {
		logger.info(`Sending request to AI model "${AI_MODEL_NAME}" for structured OCR...`);
		const { object } = await generateObject({
			model: openrouter(AI_MODEL_NAME),
			messages: messages,
			schema: receiptSchema
		});
		logger.info('AI model responded successfully.');
		return object;
	} catch (e) {
		const error = e as Error & { cause?: { status?: number } };
		let errorMessage = 'Failed to process receipt image with AI.';

		// Check for a more specific error, like a model not found error (often a 404).
		if (error.message.includes('Model not found') || error.cause?.status === 404) {
			errorMessage = `The configured AI model "${AI_MODEL_NAME}" was not found. Please check the AI_MODEL_NAME environment variable.`;
			logger.error(errorMessage, error, { modelName: AI_MODEL_NAME });
		} else {
			logger.error('An unexpected error occurred during AI OCR processing.', error, {
				modelName: AI_MODEL_NAME
			});
		}

		throw new Error(errorMessage);
	}
}

// Re-export the schema for use in the server action.
export const receiptZodSchema = receiptSchema;

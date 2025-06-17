// src/lib/server/ai.ts

import { env } from '$env/dynamic/private';
import { createOpenAI } from '@ai-sdk/openai';
// Import 'generateObject' instead of 'streamObject'
import { type CoreMessage, generateObject } from 'ai';
import { z } from 'zod';

// Configure the AI client to use OpenRouter
const openrouter = createOpenAI({
	baseURL: 'https://openrouter.ai/api/v1',
	apiKey: env.OPENROUTER_API_KEY
});

// Define the expected structure of an item on the receipt
const itemSchema = z.object({
	name: z.string().describe('The name of the item purchased.'),
	quantity: z.number().describe('The quantity of the item.'),
	price: z.number().describe('The total price for this line item.')
});

// Define the full schema for the OCR result
const receiptSchema = z.object({
	store: z.string().optional().describe('The name of the store.'),
	date: z.string().optional().describe('The date of the purchase in YYYY-MM-DD format.'),
	total: z.number().optional().describe('The final total amount of the receipt.'),
	items: z.array(itemSchema).describe('An array of all items listed on the receipt.')
});

/**
 * Performs OCR on a receipt image file using Gemini.
 * @param {File} file - The image file of the receipt.
 * @returns {Promise<object>} The extracted and structured receipt data.
 */
export async function ocrReceipt(file: File) {
	// Convert the image file to a base64 string to send to the model.
	const buffer = await file.arrayBuffer();
	const base64Image = Buffer.from(buffer).toString('base64');
	const mimeType = file.type;

	const messages: CoreMessage[] = [
		{
			role: 'user',
			content: [
				{
					type: 'text',
					text: 'Extract the store name, date, total amount, and all line items from this grocery receipt. For each item, provide its name, quantity, and price. Structure the output as a JSON object.'
				},
				{
					type: 'image',
					image: `data:${mimeType};base64,${base64Image}`
				}
			]
		}
	];

	try {
		console.log('Sending request to AI model...');
		// Use generateObject to get a structured JSON response.
		// This is a non-streaming call and is less likely to hang.
		const { object } = await generateObject({
			model: openrouter('google/gemini-2.5-flash-preview-05-20'),
			messages: messages,
			schema: receiptSchema
		});
		console.log('AI model responded successfully.');
		return object;
	} catch (error) {
		console.error('AI OCR processing failed:', error);
		throw new Error('Failed to process receipt image with AI.');
	}
}

// Re-export the schema so we can use it for validation in our server action.
export const receiptZodSchema = receiptSchema;

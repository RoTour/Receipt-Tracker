
// src/lib/server/ai.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ocrReceipt } from './ai';
import { generateObject } from 'ai';
import { logger } from '$lib/server/logger';

// Mock the entire 'ai' module
vi.mock('ai', () => ({
	generateObject: vi.fn()
}));

// Mock the logger
vi.mock('$lib/server/logger', () => ({
	logger: {
		info: vi.fn(),
		error: vi.fn()
	}
}));

describe('ocrReceipt', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const mockFile = new File(['dummy content'], 'receipt.jpg', { type: 'image/jpeg' });

	it('should call generateObject with the correct parameters and return the result', async () => {
		// Arrange
		const mockResponse = {
			store_name: 'Test Store',
			purchase_date: '2025-07-15',
			items: [
				{
					raw_text: 'item 1',
					normalized_name: 'Item 1',
					quantity: 1,
					price: 10
				}
			]
		};

		(generateObject as vi.Mock).mockResolvedValue({ object: mockResponse });

		// Act
		const result = await ocrReceipt(mockFile);

		// Assert
		expect(result).toEqual(mockResponse);
		expect(generateObject).toHaveBeenCalledOnce();
		const callArg = (generateObject as vi.Mock).mock.calls[0][0];
		expect(callArg.model).toBeDefined();
		expect(callArg.schema).toBeDefined();
		expect(callArg.messages[0].role).toBe('user');

		const content = callArg.messages[0].content;
		expect(content).toHaveLength(2);
		expect(content[0].type).toBe('text');
		expect(content[1].type).toBe('image');
		expect((content[1].image as string)).toContain('data:image/jpeg;base64,');

		expect(logger.info).toHaveBeenCalledWith(
			`Sending request to AI model "${process.env.AI_MODEL_NAME || 'google/gemini-2.5-flash-preview-05-20'}" for structured OCR...`
		);
		expect(logger.info).toHaveBeenCalledWith('AI model responded successfully.');
	});

	it('should throw a generic error and log if the AI call fails for an unknown reason', async () => {
		// Arrange
		const mockError = new Error('AI API Error');
		(generateObject as vi.Mock).mockRejectedValue(mockError);

		// Act & Assert
		await expect(ocrReceipt(mockFile)).rejects.toThrow('Failed to process receipt image with AI.');
		expect(logger.error).toHaveBeenCalledOnce();
		expect(logger.error).toHaveBeenCalledWith(
			'An unexpected error occurred during AI OCR processing.',
			mockError,
			{ modelName: expect.any(String) }
		);
	});

	it('should throw a specific error and log if the model is not found', async () => {
		// Arrange
		const modelNotFoundError = new Error('Model not found');
		(generateObject as vi.Mock).mockRejectedValue(modelNotFoundError);

		// Act & Assert
		await expect(ocrReceipt(mockFile)).rejects.toThrow(
			/The configured AI model ".*" was not found/
		);
		expect(logger.error).toHaveBeenCalledOnce();
		expect(logger.error).toHaveBeenCalledWith(
			expect.stringContaining('was not found'),
			modelNotFoundError,
			{ modelName: expect.any(String) }
		);
	});
});

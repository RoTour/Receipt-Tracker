
// src/lib/server/ai.test.ts
import { describe, it, expect, vi } from 'vitest';
import { ocrReceipt } from './ai';
import { generateObject } from 'ai';

// Mock the entire 'ai' module
vi.mock('ai', () => ({
  generateObject: vi.fn(),
}));

describe('ocrReceipt', () => {
  it('should call generateObject with the correct parameters and return the result', async () => {
    // Arrange
    const mockFile = new File(['dummy content'], 'receipt.jpg', { type: 'image/jpeg' });
    const mockResponse = {
      store_name: 'Test Store',
      purchase_date: '2025-07-15',
      items: [
        {
          raw_text: 'item 1',
          normalized_name: 'Item 1',
          quantity: 1,
          price: 10,
        },
      ],
    };

    // Mock the implementation of generateObject
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
  });

  it('should throw an error if the AI call fails', async () => {
    // Arrange
    const mockFile = new File(['dummy content'], 'receipt.jpg', { type: 'image/jpeg' });
    const mockError = new Error('AI API Error');
    (generateObject as vi.Mock).mockRejectedValue(mockError);

    // Act & Assert
    await expect(ocrReceipt(mockFile)).rejects.toThrow('Failed to process receipt image with AI.');
  });
});

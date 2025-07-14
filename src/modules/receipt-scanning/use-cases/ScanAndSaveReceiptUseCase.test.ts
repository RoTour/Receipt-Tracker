
// src/modules/receipt-scanning/use-cases/ScanAndSaveReceiptUseCase.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ScanAndSaveReceiptUseCase } from './ScanAndSaveReceiptUseCase';
import type {
	FileStorage,
	ProductRepository,
	ReceiptItemRepository,
	ReceiptRepository,
	ReceiptScanner
} from '../domain/ports';
import type { Product, Receipt } from '../domain/entities';

// --- Mock Dependencies ---

const mockFileStorage: FileStorage = {
	upload: vi.fn()
};

const mockReceiptScanner: ReceiptScanner = {
	scan: vi.fn()
};

const mockReceiptRepository: ReceiptRepository = {
	findByHash: vi.fn(),
	save: vi.fn()
};

const mockProductRepository: ProductRepository = {
	findAlias: vi.fn(),
	upsert: vi.fn()
};

const mockReceiptItemRepository: ReceiptItemRepository = {
	save: vi.fn()
};

// --- Test Suite ---

describe('ScanAndSaveReceiptUseCase', () => {
	// Reset mocks before each test to ensure isolation
	beforeEach(() => {
		vi.resetAllMocks();
	});

	const useCase = new ScanAndSaveReceiptUseCase(
		mockFileStorage,
		mockReceiptScanner,
		mockReceiptRepository,
		mockProductRepository,
		mockReceiptItemRepository
	);

	const mockFile = new File(['dummy content'], 'receipt.jpg', { type: 'image/jpeg' });
	const mockScannedReceipt: Omit<Receipt, 'id' | 'file_path' | 'file_hash' | 'content_hash'> = {
		store_name: 'Test Store',
		purchase_date: '2025-07-15',
		total: 2.5,
		items: [
			{
				raw_text: 'Test Item 1',
				quantity: 1,
				price: 1.0,
				product: { id: '', normalized_name: 'Test Item 1', brand: 'TestBrand' }
			},
			{
				raw_text: 'Test Item 2',
				quantity: 2,
				price: 1.5,
				product: { id: '', normalized_name: 'Test Item 2' }
			}
		]
	};

	it('should successfully scan, save, and process a new receipt', async () => {
		// Arrange
		mockReceiptRepository.findByHash.mockResolvedValue(null); // No existing file or content
		mockReceiptScanner.scan.mockResolvedValue(mockScannedReceipt);
		mockFileStorage.upload.mockResolvedValue('public/receipt.jpg');
		mockReceiptRepository.save.mockResolvedValue('new-receipt-id');
		mockProductRepository.findAlias.mockResolvedValue(null); // No existing alias
		mockProductRepository.upsert.mockImplementation(async (p) => ({ ...p, id: 'new-prod-id' }));

		// Act
		const result = await useCase.execute(mockFile);

		// Assert
		expect(result.success).toBe(true);
		expect(result.receipt?.id).toBe('new-receipt-id');
		expect(mockFileStorage.upload).toHaveBeenCalledOnce();
		expect(mockReceiptScanner.scan).toHaveBeenCalledOnce();
		expect(mockReceiptRepository.save).toHaveBeenCalledOnce();
		expect(mockProductRepository.upsert).toHaveBeenCalledTimes(2);
		expect(mockReceiptItemRepository.save).toHaveBeenCalledTimes(2);
	});

	it('should use an existing product alias when found', async () => {
		// Arrange
		const aliasedProduct: Product = { id: 'aliased-prod-456', normalized_name: 'Aliased Product' };
		mockReceiptRepository.findByHash.mockResolvedValue(null);
		mockReceiptScanner.scan.mockResolvedValue(mockScannedReceipt);
		mockFileStorage.upload.mockResolvedValue('public/receipt.jpg');
		mockReceiptRepository.save.mockResolvedValue('new-receipt-id-alias');
		mockProductRepository.findAlias.mockResolvedValue(aliasedProduct); // Alias found

		// Act
		await useCase.execute(mockFile);

		// Assert
		expect(mockProductRepository.findAlias).toHaveBeenCalledTimes(2);
		expect(mockProductRepository.upsert).not.toHaveBeenCalled(); // Should not create new products
		expect(mockReceiptItemRepository.save).toHaveBeenCalledTimes(2);
		// Check that the correct product ID was used for saving
		expect(mockReceiptItemRepository.save).toHaveBeenCalledWith(
			expect.objectContaining({ product_id: 'aliased-prod-456' })
		);
	});

	it('should skip processing if file hash already exists', async () => {
		// Arrange
		mockReceiptRepository.findByHash.mockResolvedValue({} as Receipt); // Simulate finding an existing file

		// Act
		const result = await useCase.execute(mockFile);

		// Assert
		expect(result.skipped).toBe(true);
		expect(result.reason).toBe('Duplicate file');
		expect(mockReceiptScanner.scan).not.toHaveBeenCalled();
		expect(mockReceiptRepository.save).not.toHaveBeenCalled();
	});

	it('should skip processing if content hash already exists', async () => {
		// Arrange
		// First call to findByHash (file) returns null, second call (content) returns a receipt
		mockReceiptRepository.findByHash.mockResolvedValueOnce(null).mockResolvedValueOnce({} as Receipt);
		mockReceiptScanner.scan.mockResolvedValue(mockScannedReceipt);

		// Act
		const result = await useCase.execute(mockFile);

		// Assert
		expect(result.skipped).toBe(true);
		expect(result.reason).toBe('Duplicate content');
		expect(mockReceiptScanner.scan).toHaveBeenCalledOnce(); // Scan is called
		expect(mockFileStorage.upload).not.toHaveBeenCalled(); // But nothing is saved
		expect(mockReceiptRepository.save).not.toHaveBeenCalled();
	});
it('should handle receipts with no items gracefully', async () => {
		// Arrange
		const receiptWithNoItems = { ...mockScannedReceipt, items: [] };
		mockReceiptRepository.findByHash.mockResolvedValue(null);
		mockReceiptScanner.scan.mockResolvedValue(receiptWithNoItems);
		mockFileStorage.upload.mockResolvedValue('public/receipt.jpg');
		mockReceiptRepository.save.mockResolvedValue('no-item-receipt-id');

		// Act
		const result = await useCase.execute(mockFile);

		// Assert
		expect(result.success).toBe(true);
		expect(result.receipt?.id).toBe('no-item-receipt-id');
		expect(mockReceiptRepository.save).toHaveBeenCalledOnce();
		// No item processing should occur
		expect(mockProductRepository.findAlias).not.toHaveBeenCalled();
		expect(mockProductRepository.upsert).not.toHaveBeenCalled();
		expect(mockReceiptItemRepository.save).not.toHaveBeenCalled();
	});

	it('should handle a mix of new and aliased products correctly', async () => {
		// Arrange
		const aliasedProduct: Product = { id: 'aliased-prod-abc', normalized_name: 'Aliased Product' };
		mockReceiptRepository.findByHash.mockResolvedValue(null);
		mockReceiptScanner.scan.mockResolvedValue(mockScannedReceipt);
		mockFileStorage.upload.mockResolvedValue('public/receipt.jpg');
		mockReceiptRepository.save.mockResolvedValue('mixed-receipt-id');

		// First item is new, second is aliased
		mockProductRepository.findAlias.mockResolvedValueOnce(null).mockResolvedValueOnce(aliasedProduct);
		mockProductRepository.upsert.mockResolvedValue({ id: 'new-prod-xyz', normalized_name: 'Test Item 1' });

		// Act
		await useCase.execute(mockFile);

		// Assert
		expect(mockProductRepository.findAlias).toHaveBeenCalledTimes(2);
		expect(mockProductRepository.upsert).toHaveBeenCalledOnce(); // Only the first item is new
		expect(mockReceiptItemRepository.save).toHaveBeenCalledTimes(2);

		// Verify the new product was saved correctly
		expect(mockReceiptItemRepository.save).toHaveBeenCalledWith(
			expect.objectContaining({ product_id: 'new-prod-xyz' })
		);
		// Verify the aliased product was saved correctly
		expect(mockReceiptItemRepository.save).toHaveBeenCalledWith(
			expect.objectContaining({ product_id: 'aliased-prod-abc' })
		);
	});

	it('should throw an error if file storage fails', async () => {
		// Arrange
		const storageError = new Error('Upload failed');
		mockReceiptRepository.findByHash.mockResolvedValue(null);
		mockReceiptScanner.scan.mockResolvedValue(mockScannedReceipt);
		mockFileStorage.upload.mockRejectedValue(storageError);

		// Act & Assert
		await expect(useCase.execute(mockFile)).rejects.toThrow(storageError);
		expect(mockReceiptRepository.save).not.toHaveBeenCalled(); // Should not proceed to save
	});

	it('should throw an error if saving the receipt fails', async () => {
		// Arrange
		const dbError = new Error('Database connection lost');
		mockReceiptRepository.findByHash.mockResolvedValue(null);
		mockReceiptScanner.scan.mockResolvedValue(mockScannedReceipt);
		mockFileStorage.upload.mockResolvedValue('public/receipt.jpg');
		mockReceiptRepository.save.mockRejectedValue(dbError);

		// Act & Assert
		await expect(useCase.execute(mockFile)).rejects.toThrow(dbError);
		expect(mockReceiptItemRepository.save).not.toHaveBeenCalled(); // Should not proceed to save items
	});
});

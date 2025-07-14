
// src/modules/data-management/use-cases/ReprocessReceiptUseCase.ts
import type { FileStorage, ReceiptRepository, ReceiptScanner, ProductRepository, ReceiptItemRepository } from '../domain/ports';
import { createHash } from 'crypto';
import { generateProductKey } from '../../../lib/server/normalization';

function createContentHash(obj: object): string {
	const stableString = JSON.stringify(obj, Object.keys(obj).sort());
	return createHash('sha256').update(Buffer.from(stableString)).digest('hex');
}

export class ReprocessReceiptUseCase {
  constructor(
    private fileStorage: FileStorage,
    private receiptScanner: ReceiptScanner,
    private receiptRepository: ReceiptRepository,
    private productRepository: ProductRepository,
    private receiptItemRepository: ReceiptItemRepository
  ) {}

  async execute(receiptId: string) {
    const receipt = await this.receiptRepository.findById(receiptId);
    if (!receipt) {
      throw new Error('Receipt not found');
    }

    const file = await this.fileStorage.download(receipt.file_path);
    const scannedReceipt = await this.receiptScanner.scan(file);
    const contentHash = createContentHash(scannedReceipt);

    await this.receiptRepository.deleteItems(receiptId);

    await this.receiptRepository.update({
        id: receiptId,
        total: scannedReceipt.total,
        content_hash: contentHash,
    });

    for (const item of scannedReceipt.items) {
        const aliasKey = generateProductKey(item.raw_text);
        let product = await this.productRepository.findAlias(aliasKey);

        if (!product) {
            product = await this.productRepository.upsert({
                ...item.product,
                normalized_key: aliasKey,
            });
        }

        await this.receiptItemRepository.save({
            ...item,
            product_id: product.id,
            receipt_id: receiptId,
        });
    }

    return { success: true, receipt: { ...scannedReceipt, id: receiptId } };
  }
}

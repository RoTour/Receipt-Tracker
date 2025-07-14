
// src/modules/receipt-scanning/use-cases/ScanAndSaveReceiptUseCase.ts

import type { FileStorage, ReceiptRepository, ReceiptScanner, ProductRepository, ReceiptItemRepository } from '../domain/ports';
import { createHash } from 'crypto';
import { generateProductKey } from '../../../lib/server/normalization';

function sha256(buffer: Buffer): string {
	return createHash('sha256').update(buffer).digest('hex');
}

function createContentHash(obj: object): string {
	const stableString = JSON.stringify(obj, Object.keys(obj).sort());
	return sha256(Buffer.from(stableString));
}

export class ScanAndSaveReceiptUseCase {
  constructor(
    private fileStorage: FileStorage,
    private receiptScanner: ReceiptScanner,
    private receiptRepository: ReceiptRepository,
    private productRepository: ProductRepository,
    private receiptItemRepository: ReceiptItemRepository
  ) {}

  async execute(file: File) {
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileHash = sha256(fileBuffer);

    const existingFile = await this.receiptRepository.findByHash(fileHash);
    if (existingFile) {
      console.log(`Skipping file ${file.name} - already exists (file hash match).`);
      return { skipped: true, reason: 'Duplicate file' };
    }

    const scannedReceipt = await this.receiptScanner.scan(file);
    const contentHash = createContentHash(scannedReceipt);

    const existingContent = await this.receiptRepository.findByHash(contentHash);
    if (existingContent) {
        console.log(`Skipping file ${file.name} - already exists (content hash match).`);
        return { skipped: true, reason: 'Duplicate content' };
    }

    const filePath = await this.fileStorage.upload(file);

    const receiptId = await this.receiptRepository.save({
      ...scannedReceipt,
      file_path: filePath,
      file_hash: fileHash,
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

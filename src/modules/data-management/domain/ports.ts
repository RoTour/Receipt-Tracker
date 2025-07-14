
// src/modules/data-management/domain/ports.ts
import type { FileStorage as ScannerFileStorage, ReceiptRepository as ScannerReceiptRepository, ReceiptScanner, ProductRepository, ReceiptItemRepository } from '../../receipt-scanning/domain/ports';
import type { Receipt } from '../../receipt-scanning/domain/entities';

export interface FileStorage extends ScannerFileStorage {
    download(filePath: string): Promise<File>;
}

export interface ReceiptRepository extends ScannerReceiptRepository {
    findById(id: string): Promise<Receipt | null>;
    deleteItems(receiptId: string): Promise<void>;
    update(receipt: Pick<Receipt, 'id' | 'total' | 'content_hash'>): Promise<void>;
}

export { ReceiptScanner, ProductRepository, ReceiptItemRepository };

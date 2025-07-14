
// src/modules/receipt-scanning/domain/ports.ts
import type { Receipt, ReceiptItem, Product } from './entities';

export interface FileStorage {
  upload(file: File): Promise<string>;
}

export interface ReceiptScanner {
  scan(file: File): Promise<Omit<Receipt, 'id' | 'file_path' | 'file_hash' | 'content_hash'>
>;
}

export interface ReceiptRepository {
  findByHash(hash: string): Promise<Receipt | null>;
  save(receipt: Omit<Receipt, 'id'>): Promise<string>;
}

export interface ProductRepository {
  findAlias(alias: string): Promise<Product | null>;
  upsert(product: Omit<Product, 'id'> & { normalized_key: string }): Promise<Product>;
}

export interface ReceiptItemRepository {
    save(item: Omit<ReceiptItem, 'product'> & { product_id: string, receipt_id: string }): Promise<void>;
}

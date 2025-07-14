
// src/modules/receipt-scanning/infrastructure/adapters/OpenAiReceiptScanner.ts
import type { ReceiptScanner } from '../../domain/ports';
import { ocrReceipt, receiptZodSchema } from '../../../../lib/server/ai';
import type { Receipt } from '../../domain/entities';

export class OpenAiReceiptScanner implements ReceiptScanner {
  async scan(file: File): Promise<Omit<Receipt, 'id' | 'file_path' | 'file_hash' | 'content_hash'>> {
    const aiResult = await ocrReceipt(file);
    const validation = receiptZodSchema.safeParse(aiResult);

    if (!validation.success) {
      throw new Error(`AI result validation failed: ${validation.error.message}`);
    }

    return {
        ...validation.data,
        items: validation.data.items.map(item => ({
            ...item,
            product: {
                id: '', // This will be filled in later
                normalized_name: item.normalized_name,
                brand: item.brand,
            }
        }))
    };
  }
}

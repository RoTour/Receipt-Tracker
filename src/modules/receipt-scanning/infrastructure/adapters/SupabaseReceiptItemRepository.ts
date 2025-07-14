
// src/modules/receipt-scanning/infrastructure/adapters/SupabaseReceiptItemRepository.ts
import type { ReceiptItemRepository } from '../../domain/ports';
import type { ReceiptItem } from '../../domain/entities';
import { supabase } from '../../../../lib/server/supabase';

export class SupabaseReceiptItemRepository implements ReceiptItemRepository {
  async save(item: Omit<ReceiptItem, 'product'> & { product_id: string, receipt_id: string }): Promise<void> {
    const { error } = await supabase.from('receipt_items').insert({
      receipt_id: item.receipt_id,
      product_id: item.product_id,
      raw_text: item.raw_text,
      quantity: item.quantity,
      price: item.price,
    });

    if (error) {
      throw new Error(`Failed to create receipt item: ${error.message}`);
    }
  }
}

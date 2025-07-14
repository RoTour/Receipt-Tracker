
// src/modules/receipt-scanning/infrastructure/adapters/SupabaseReceiptRepository.ts
import type { ReceiptRepository } from '../../domain/ports';
import type { Receipt } from '../../domain/entities';
import { supabase } from '../../../../lib/server/supabase';
import { generateStoreKey } from '../../../../lib/server/normalization';

export class SupabaseReceiptRepository implements ReceiptRepository {
  async findByHash(hash: string): Promise<Receipt | null> {
    const { data } = await supabase
      .from('receipts')
      .select('id')
      .or(`file_hash.eq.${hash},content_hash.eq.${hash}`)
      .single();
    return data as Receipt | null;
  }

  async save(receipt: Omit<Receipt, 'id'>): Promise<string> {
    const storeKey = generateStoreKey(receipt.store_name, receipt.store_location);

    let storeId: string;

    // First, try to find the store by its normalized key.
    const { data: existingStore, error: selectError } = await supabase
      .from('stores')
      .select('id')
      .eq('normalized_key', storeKey)
      .single();

    if (existingStore) {
      storeId = existingStore.id;
    } else {
      // If no store is found, create a new one.
      const { data: newStore, error: insertError } = await supabase
        .from('stores')
        .insert({
          normalized_key: storeKey,
          name: receipt.store_name,
          location: receipt.store_location
        })
        .select('id')
        .single();

      if (insertError) {
        throw new Error(`Failed to create store: ${insertError.message}`);
      }
      storeId = newStore.id;
    }

    const { data: receiptRecord, error: receiptError } = await supabase
      .from('receipts')
      .insert({
        store_id: storeId,
        purchase_date: receipt.purchase_date,
        total: receipt.total,
        file_path: receipt.file_path,
        file_hash: receipt.file_hash,
        content_hash: receipt.content_hash
      })
      .select('id')
      .single();

    if (receiptError) {
      throw new Error(`Failed to create receipt: ${receiptError.message}`);
    }

    return receiptRecord.id;
  }
  async findById(id: string): Promise<Receipt | null> {
    const { data } = await supabase
      .from('receipts')
      .select('*')
      .eq('id', id)
      .single();
    return data as Receipt | null;
  }

  async deleteItems(receiptId: string): Promise<void> {
    const { error } = await supabase
      .from('receipt_items')
      .delete()
      .eq('receipt_id', receiptId);

    if (error) {
      throw new Error(`Failed to delete receipt items: ${error.message}`);
    }
  }

  async update(receipt: Pick<Receipt, 'id' | 'total' | 'content_hash'>): Promise<void> {
    const { error } = await supabase
      .from('receipts')
      .update({
        total: receipt.total,
        content_hash: receipt.content_hash,
      })
      .eq('id', receipt.id);

    if (error) {
      throw new Error(`Failed to update receipt: ${error.message}`);
    }
  }
}


// src/lib/server/db_helpers.test.ts
import { describe, it, expect, vi } from 'vitest';
import { processAndSaveReceiptItems } from './db_helpers';
import type { SupabaseClient } from '@supabase/supabase-js';

// Mock Supabase client
const createMockSupabaseClient = () => ({
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
    upsert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
    insert: vi.fn(),
  })),
});

describe('processAndSaveReceiptItems', () => {
  it('should process and save items correctly, checking for aliases first', async () => {
    const mockSupabase = createMockSupabaseClient();
    const receiptId = 'receipt-123';
    const items = [
      { raw_text: 'Milk 1L', normalized_name: 'Milk', brand: 'BrandA', quantity: 1, price: 1.5 },
      { raw_text: 'Bread', normalized_name: 'Bread', brand: 'BrandB', quantity: 1, price: 2.0 },
    ];

    // Mock alias lookup
    mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'product_aliases') {
            return {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: { product_id: 'aliased-product-id' } }),
            }
        }
        if (table === 'products') {
            return {
                upsert: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: { id: 'new-product-id' } })
            }
        }
        if (table === 'receipt_items') {
            return {
                insert: vi.fn().mockResolvedValue({ error: null })
            }
        }
        return {
            from: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockReturnThis(),
            upsert: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
        }
    });

    await processAndSaveReceiptItems(mockSupabase as unknown as SupabaseClient, receiptId, items);

    expect(mockSupabase.from).toHaveBeenCalledWith('product_aliases');
    expect(mockSupabase.from).toHaveBeenCalledWith('receipt_items');
  });
});

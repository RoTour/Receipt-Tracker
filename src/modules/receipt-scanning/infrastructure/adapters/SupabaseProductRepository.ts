
// src/modules/receipt-scanning/infrastructure/adapters/SupabaseProductRepository.ts
import type { ProductRepository } from '../../domain/ports';
import type { Product } from '../../domain/entities';
import { supabase } from '../../../../lib/server/supabase';

export class SupabaseProductRepository implements ProductRepository {
  async findAlias(alias: string): Promise<Product | null> {
    const { data } = await supabase
      .from('product_aliases')
      .select('products (*)')
      .eq('alias_text', alias)
      .single();

    if (data && data.products) {
        return data.products as Product;
    }
    return null;
  }

  async upsert(product: Omit<Product, 'id'> & { normalized_key: string }): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .upsert(
        {
          normalized_key: product.normalized_key,
          normalized_name: product.normalized_name,
          brand: product.brand,
          is_verified: false,
        },
        { onConflict: 'normalized_key', ignoreDuplicates: false }
      )
      .select('id, normalized_name, brand')
      .single();

    if (error) {
      throw new Error(`Failed to upsert product: ${error.message}`);
    }

    return data as Product;
  }
}

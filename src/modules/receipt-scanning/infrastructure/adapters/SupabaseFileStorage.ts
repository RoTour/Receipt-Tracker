
// src/modules/receipt-scanning/infrastructure/adapters/SupabaseFileStorage.ts
import type { FileStorage } from '../../domain/ports';
import { supabase } from '../../../../lib/server/supabase';
import { env as publicEnv } from '$env/dynamic/public';

export class SupabaseFileStorage implements FileStorage {
  async upload(file: File): Promise<string> {
    const bucketName = publicEnv.PUBLIC_SUPABASE_BUCKET_NAME;
    if (!bucketName) {
      throw new Error('Supabase bucket name is not configured.');
    }

    const filePath = `public/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Storage error: ${uploadError.message}`);
    }

    return filePath;
  }
  async download(filePath: string): Promise<File> {
    const bucketName = publicEnv.PUBLIC_SUPABASE_BUCKET_NAME;
    if (!bucketName) {
      throw new Error('Supabase bucket name is not configured.');
    }

    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(filePath);

    if (error) {
      throw new Error(`Failed to download file: ${error.message}`);
    }

    return new File([data], filePath.split('/').pop() || 'receipt', { type: data.type });
  }
}

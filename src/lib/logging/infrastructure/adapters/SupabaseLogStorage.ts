// src/lib/logging/infrastructure/adapters/SupabaseLogStorage.ts
import { supabase } from '../../../server/supabase';
import type { LogStorage, LogPayload } from '../../domain/ports';

/**
 * A LogStorage adapter that persists logs to the Supabase database.
 * We only store logs of level 'ERROR' to avoid excessive database writes.
 */
export class SupabaseLogStorage implements LogStorage {
  async store({ level, message, stack_trace, metadata }: LogPayload): Promise<void> {
    if (level !== 'ERROR') {
      return; // Only persist critical errors
    }

    const { error } = await supabase.from('logs').insert({
      level,
      message,
      stack_trace,
      metadata,
    });

    if (error) {
      console.error('Failed to persist log to Supabase:', error);
    }
  }
}

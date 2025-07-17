// src/lib/logging/infrastructure/adapters/ConsoleLogStorage.ts
import type { LogStorage, LogPayload } from '../../domain/ports';

/**
 * A LogStorage adapter that writes logs to the console (stdout/stderr).
 * This is essential for Docker-based and local development visibility.
 */
export class ConsoleLogStorage implements LogStorage {
  async store(payload: LogPayload): Promise<void> {
    const logMethod = payload.level === 'ERROR' ? console.error : console.log;
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...payload,
    };
    logMethod(JSON.stringify(logEntry, null, 2));
  }
}

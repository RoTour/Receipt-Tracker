// src/lib/logging/application/Logger.ts
import type { Logger as ILogger, LogStorage, LogLevel } from '../domain/ports';

/**
 * A composite logger that distributes log payloads to multiple storage adapters.
 */
export class CompositeLogger implements ILogger {
  constructor(private storages: LogStorage[]) {}

  private async log(level: LogLevel, message: string, error?: Error, metadata?: Record<string, unknown>) {
    const payload = {
      level,
      message,
      stack_trace: error?.stack,
      metadata: { ...metadata, errorMessage: error?.message },
    };

    // Dispatch the log to all registered storages in parallel
    await Promise.all(this.storages.map(storage => storage.store(payload)));
  }

  info(message: string, metadata?: Record<string, unknown>) {
    this.log('INFO', message, undefined, metadata);
  }
  warn(message: string, metadata?: Record<string, unknown>) {
    this.log('WARN', message, undefined, metadata);
  }
  error(message: string, error?: Error, metadata?: Record<string, unknown>) {
    this.log('ERROR', message, error, metadata);
  }
  debug(message: string, metadata?: Record<string, unknown>) {
    this.log('DEBUG', message, undefined, metadata);
  }
}

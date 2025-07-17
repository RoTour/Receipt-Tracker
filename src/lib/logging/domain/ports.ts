// src/lib/logging/domain/ports.ts

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export interface LogPayload {
  level: LogLevel;
  message: string;
  stack_trace?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Defines the contract for any destination that can store or process logs.
 */
export interface LogStorage {
  store(payload: LogPayload): Promise<void>;
}

/**
 * Defines the main logger interface that the application will use.
 */
export interface Logger {
  info(message: string, metadata?: Record<string, unknown>): void;
  warn(message: string, metadata?: Record<string, unknown>): void;
  error(message: string, error?: Error, metadata?: Record<string, unknown>): void;
  debug(message: string, metadata?: Record<string, unknown>): void;
}

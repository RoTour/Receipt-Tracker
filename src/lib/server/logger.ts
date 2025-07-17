// src/lib/server/logger.ts
import { CompositeLogger } from '../logging/application/Logger';
import { ConsoleLogStorage } from '../logging/infrastructure/adapters/ConsoleLogStorage';
import { SupabaseLogStorage } from '../logging/infrastructure/adapters/SupabaseLogStorage';

// Instantiate and configure the logger for server-side use.
// Adding a new destination (like Sentry) is as simple as adding a new adapter here.
export const logger = new CompositeLogger([
  new ConsoleLogStorage(),
  new SupabaseLogStorage(),
]);

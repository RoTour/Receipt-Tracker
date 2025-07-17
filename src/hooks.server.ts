// src/hooks.server.ts
import { logger } from './lib/server/logger';
import type { HandleServerError } from '@sveltejs/kit';

export const handleError: HandleServerError = ({ error, event }) => {
  const err = error as Error;
  const message = err.message ?? 'An unknown error occurred.';

  // Log the error using our new centralized logger
  logger.error(message, err, {
    path: event.url.pathname,
    user_agent: event.request.headers.get('user-agent'),
  });

  // Return a standard error shape to the client
  return {
    message: 'Whoops! Something went wrong on our end.',
    code: 'INTERNAL_SERVER_ERROR',
  };
};

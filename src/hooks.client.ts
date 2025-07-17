// src/hooks.client.ts
import type { HandleClientError } from '@sveltejs/kit';

export const handleError: HandleClientError = async ({ error, event }) => {
  const err = error as Error;

  const errorData = {
    message: err.message,
    stack: err.stack,
    metadata: {
      path: event.url.pathname,
      timestamp: new Date().toISOString(),
    },
  };

  // Send the error to our backend endpoint
  // We use `navigator.sendBeacon` if available for reliability on page unload
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/log-error', JSON.stringify(errorData));
  } else {
    await fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorData),
    });
  }

  // Optionally return a user-friendly error message
  return {
    message: 'An unexpected error occurred. Please try again.',
  };
};

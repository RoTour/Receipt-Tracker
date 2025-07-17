// src/routes/api/log-error/+server.ts
import { json } from '@sveltejs/kit';
import { logger } from '../../../lib/server/logger';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const { message, stack, metadata } = await request.json();

  // Use our logger to handle the error from the client
  logger.error(message, { name: 'ClientError', message, stack }, metadata);

  return json({ success: true });
};

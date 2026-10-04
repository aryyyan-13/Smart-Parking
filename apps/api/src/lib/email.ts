import { Resend } from 'resend';
import { env } from '../config/env.js';

/**
 * Resend email client.
 * Use via the notification service — do not call directly from route handlers.
 */
export const resend = new Resend(env.RESEND_API_KEY);

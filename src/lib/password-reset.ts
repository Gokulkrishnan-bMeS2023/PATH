/**
 * Password reset by email needs a server that owns the account emails.
 * PATH currently stores accounts only on the device, so the reset endpoint is
 * optional configuration: set EXPO_PUBLIC_PASSWORD_RESET_URL (and optionally
 * EXPO_PUBLIC_PASSWORD_RESET_EXPIRY, e.g. "1 hour") to enable the email flow.
 */
const RESET_URL = process.env.EXPO_PUBLIC_PASSWORD_RESET_URL;

export const passwordResetAvailable = !!RESET_URL;

/** How long reset links stay valid, as the server reports it (for display only). */
export const resetLinkExpiry = process.env.EXPO_PUBLIC_PASSWORD_RESET_EXPIRY ?? null;

/**
 * Asks the server to email a reset link. The server should respond the same way
 * whether or not the account exists, so the app never reveals which emails are registered.
 */
export async function requestPasswordReset(identifier: string): Promise<void> {
  if (!RESET_URL) throw new Error('RESET_UNAVAILABLE');
  const res = await fetch(RESET_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: identifier.trim() }),
  });
  if (!res.ok) throw new Error('RESET_FAILED');
}

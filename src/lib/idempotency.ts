/**
 * Idempotency Key Utilities
 * 
 * Prevents double-spending during network retries or low-connectivity disconnects
 * by generating RFC 4122 v4 UUIDs for outgoing transactions.
 */

/**
 * Generates an RFC4122 v4 UUID string.
 */
export function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  
  // Safe fallback for environments where crypto.randomUUID might not be available
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

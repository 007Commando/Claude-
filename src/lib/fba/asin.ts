/**
 * Pulls an ASIN out of whatever a person pastes: the ASIN itself, or any
 * Amazon product link that carries one (/dp/, /gp/product/, /gp/aw/d/).
 * Returns null for anything else, so the caller can say so instead of
 * sending a guess to the server.
 */
export const extractAsin = (input: string): string | null => {
  const text = input.trim();
  if (!text) return null;
  if (/^[A-Za-z0-9]{10}$/.test(text)) return text.toUpperCase();
  const match = text.match(/(?:\/dp\/|\/gp\/product\/|\/gp\/aw\/d\/|\/product\/|[?&]asin=)([A-Za-z0-9]{10})(?:[/?&#]|$)/i);
  return match ? match[1].toUpperCase() : null;
};

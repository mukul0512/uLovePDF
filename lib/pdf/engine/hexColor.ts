const FALLBACK_RGB = [0.114, 0.259, 0.459] as const; // brand ink #1d4275

/**
 * Parses `#rrggbb` into pdf-lib's 0–1 channels.
 *
 * Annotation colours are stored as CSS hex. Anything we cannot parse falls
 * back to the brand ink rather than throwing mid-export and losing the file.
 */
export function hexToRgb01(hex: string): readonly [number, number, number] {
  const normalized = hex.startsWith('#') ? hex.slice(1) : hex;
  if (normalized.length !== 6) return FALLBACK_RGB;

  const value = Number.parseInt(normalized, 16);
  if (!Number.isFinite(value)) return FALLBACK_RGB;

  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

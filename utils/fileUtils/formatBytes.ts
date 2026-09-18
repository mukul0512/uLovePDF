const UNITS = ['B', 'KB', 'MB', 'GB'] as const;
const STEP = 1024;

/** Renders a byte count for display, e.g. `2.4 MB`. */
export const formatBytes = (bytes: number, fractionDigits = 1): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';

  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(STEP)), UNITS.length - 1);
  const unit = UNITS[exponent] ?? 'B';
  const value = bytes / STEP ** exponent;

  return `${value.toFixed(exponent === 0 ? 0 : fractionDigits)} ${unit}`;
};

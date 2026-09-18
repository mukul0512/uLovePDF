/** Constrains `value` to the inclusive range `[minimum, maximum]`. */
export const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(Math.max(value, minimum), maximum);

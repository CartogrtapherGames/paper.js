/**
 * clamp a value in a min and max range
 * @param value
 * @param min
 * @param max
 */
export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

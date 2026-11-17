/**
 * check whether the browser/ environment support ImageBitmap API
 * @constructor
 * @return {boolean} true if the current environment support ImageBitmap.
 */
export function IsImageBitmapSupported(): boolean {
  return typeof createImageBitmap === "function";
}
